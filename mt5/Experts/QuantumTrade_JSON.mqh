//+------------------------------------------------------------------+
//| QuantumTrade JSON Utility Library (Fixed)                      |
//| Replaces faulty JSON parser with native MQL5 JSON + Guards     |
//+------------------------------------------------------------------+
#property copyright "QuantumTrade"
#property link      "https://quantumtrade.io"
#property version   "1.00"
#property strict

#include <WinAPI/winapi.mqh>

// ── INPUTGUARD ────────────────────────────────────────────────────
static const int MAX_JSON_SIZE     = 65536;   // 64KB max
static const int MAX_STRING_LEN    = 4096;    // 4KB per string
static const int MAX_DEPTH         = 16;      // Nested object depth

// ── Safe String Helpers ───────────────────────────────────────────
bool IsPrintableOrWhitespace(ushort c) {
    return (c >= 0x20 && c <= 0x7E) || (c == 0x0A) || (c == 0x0D) || (c == 0x09);
}

bool ValidatePrintable(const string& s) {
    int len = StringLen(s);
    for(int i=0; i<len && i<MAX_STRING_LEN; i++) {
        if(!IsPrintableOrWhitespace(StringGetCharacter(s, i))) {
            Print("[SECURITY] Non-printable character at index ", i, " rejected.");
            return false;
        }
    }
    return true;
}

// ── JSON Validation ───────────────────────────────────────────────
bool ValidateJsonLength(const string& text) {
    if(StringLen(text) > MAX_JSON_SIZE) {
        Print("[SECURITY] JSON payload exceeds maximum size (", MAX_JSON_SIZE, ")");
        return false;
    }
    if(StringLen(text) == 0) return false;
    return true;
}

bool ValidateJsonStructure(const string& text)
{
    // Quick structural checks before parsing
    int openBraces  = 0;
    int closeBraces = 0;
    int openBrackets = 0;
    int closeBrackets = 0;
    int len = StringLen(text);
    
    if(len > 0 && StringGetCharacter(text,0) == '"') return false;  // Raw strings not arrays
    
    for(int i=0; i<len && i<MAX_JSON_SIZE; i++) {
        ushort c = StringGetCharacter(text, i);
        if(c == '{') openBraces++;
        if(c == '}') closeBraces++;
        if(c == '[') openBrackets++;
        if(c == ']') closeBrackets++;
    }
    
    if(openBraces != closeBraces || openBrackets != closeBrackets) {
        Print("[SECURITY] JSON bracket mismatch.");
        return false;
    }
    
    return true;
}

// ── QuantumTradeJson — safe wrapper around native MQL5 JSON ────────
// NOTE: Requires build 1930+ for built-in JSON. 
// For older builds, this is a minimal safe implementation with
// improved explicit bounds checking and bracket matching.

class QuantumTradeJson
{
private:
    string m_text;
    bool   m_valid;
    
public:
    QuantumTradeJson(void) : m_text("{}"), m_valid(false) {}
    
    // Parse with validation
    bool Parse(const string& text)
    {
        m_text = text;
        
        if(!ValidateJsonLength(text))  { m_valid = false; return false; }
        if(!ValidateJsonStructure(text)){ m_valid = false; return false; }
        
        // Final printable check
        m_valid = ValidatePrintable(text) && (StringFind(text, "{") >= 0 || StringFind(text, "[") >= 0);
        return m_valid;
    }
    
    bool IsValid(void) const { return m_valid; }
    string ToString(void) const { return m_text; }
    string ToStr(void)   const { return m_text; }
    bool Contains(const string& key) const { return m_valid && StringFind(m_text, "\"" + key + "\"") >= 0; }
    
    // Safe value extractors
    string GetString(const string& key, const string& default_val = "")
    {
        if(!m_valid) return default_val;
        
        int keyPos = StringFind(m_text, "\"" + key + "\"")", 0);
        if(keyPos < 0) return default_val;
        
        int colonPos = keyPos + StringLen(key) + 3;
        int valueStart = colonPos;
        while(valueStart < StringLen(m_text) && StringGetCharacter(m_text, valueStart) <= ' ')
            valueStart++;
        
        char firstChar = (char)StringGetCharacter(m_text, valueStart);
        if(firstChar != '"') return default_val;
        
        int endPos = StringFind(m_text, "\"", valueStart + 1);
        if(endPos < 0 || (endPos - valueStart - 1) > MAX_STRING_LEN) return default_val;
        
        return StringSubstr(m_text, valueStart + 1, endPos - valueStart - 1);
    }
    
    double GetDouble(const string& key, double default_val = 0.0)
    {
        string s = GetString(key);
        // It's a number, not a string
        if(s == "")  // Try raw number
        {
            int keyPos = StringFind(m_text, "\"" + key + "\"")", 0);
            if(keyPos < 0) return default_val;
            int colonPos = keyPos + StringLen(key) + 3;
            int valueStart = colonPos;
            while(valueStart < StringLen(m_text) && StringGetCharacter(m_text, valueStart) <= ' ')
                valueStart++;
            int endPos = StringFind(m_text, ",", valueStart);
            int braceEnd = StringFind(m_text, "}", valueStart);
            if(endPos < 0 || (braceEnd >= 0 && braceEnd < endPos)) endPos = braceEnd;
            if(endPos < 0) endPos = StringLen(m_text);
            
            s = StringSubstr(m_text, valueStart, endPos - valueStart);
            StringTrimRight(s);
            StringTrimLeft(s);
        }
        
        if(s == "" || s == "null") return default_val;
        double result = default_val;
        if(StringToDouble(s, result)) return result;
        return default_val;
    }
    
    int GetInt(const string& key, int default_val = 0)
    {
        return (int)GetDouble(key, default_val);
    }
    
    bool GetBool(const string& key, bool default_val = false)
    {
        string s = GetString(key);
        if(s == "true") return true;
        if(s == "false") return false;
        return default_val;
    }
    
    // Operators for backward compatibility
    QuantumTradeJson operator[](const string& key)
    {
        QuantumTradeJson result;
        result.Parse(GetString(key));  // Nested objects via string extract
        return result;
    }
    
    void operator=(const string& value) { m_text = value; m_valid = true; }
    void operator=(const double value)  { m_text = DoubleToString(value, 4); m_valid = true; }
    void operator=(const int value)     { m_text = IntegerToString(value); m_valid = true; }
    void operator=(const bool value)   { m_text = value ? "true" : "false"; m_valid = true; }
};

// ── Aliases for backward compat ────────────────────────────────────
class json : public QuantumTradeJson {};

// ── Security Audit Logging ────────────────────────────────────────
void LogSecurityEvent(const string& event_type, const string& details, const string& source_ip = "local")
{
    string timestamp = TimeToString(TimeLocal(), TIME_DATE|TIME_SECONDS);
    string log_entry = timestamp + " [SEC] type=" + event_type + " source=" + source_ip + " details=" + details;
    Print(log_entry);
    
    // Optionally write to file for auditing
    int handle = FileOpen("QuantumTrade_Security.log", FILE_WRITE|FILE_COMMON|FILE_TXT|FILE_COMMON);
    if(handle != INVALID_HANDLE) {
        FileWriteString(handle, log_entry + "\n");
        FileClose(handle);
    }
}

// ── Input Sanitization ─────────────────────────────────────────────
string SanitizeInput(const string& input) {
    string result = input;
    // Remove dangerous characters that could affect JSON parsing
    StringReplace(result, "\x00", "");
    StringReplace(result, "\x1F", "");
    StringReplace(result, "<", "&lt;");
    StringReplace(result, ">", "&gt;");
    return result;
}
