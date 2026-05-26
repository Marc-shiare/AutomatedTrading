#property copyright "QuantumTrade"
#property link      "https://quantumtrade.io"
#property version   "1.00"
#property strict

// ── TradeManager Class ──
class TradeManager
{
private:
    int    m_magicNumber;
    string m_logPrefix;
    
public:
    TradeManager(int magic = 123456) : m_magicNumber(magic)
    {
        m_logPrefix = "[TradeManager]";
    }
    
    // Open BUY order
    bool OpenBuy(const string symbol, double volume, double slPrice = 0.0, double tpPrice = 0.0)
    {
        MqlTradeRequest request = {};
        MqlTradeResult  result  = {};
        
        request.action       = TRADE_ACTION_DEAL;
        request.symbol       = symbol;
        request.volume       = NormalizeDouble(volume, 2);
        request.type         = ORDER_TYPE_BUY;
        request.price        = SymbolInfoDouble(symbol, SYMBOL_ASK);
        request.sl           = slPrice > 0 ? NormalizeDouble(slPrice, _Digits) : 0;
        request.tp           = tpPrice > 0 ? NormalizeDouble(tpPrice, _Digits) : 0;
        request.deviation    = 10;  // Slippage in points
        request.magic        = m_magicNumber;
        request.comment      = "QuantumTrade";
        request.type_filling = GetFillingMode(symbol);
        
        if(!OrderSend(request, result))
        {
            Print(m_logPrefix, " BUY failed: ", GetLastError(), ", retcode=", result.retcode);
            return false;
        }
        
        Print(m_logPrefix, " BUY executed: ", symbol, ", Lots=", volume, ", Price=", result.price, ", Ticket=", result.order);
        return true;
    }
    
    // Open SELL order
    bool OpenSell(const string symbol, double volume, double slPrice = 0.0, double tpPrice = 0.0)
    {
        MqlTradeRequest request = {};
        MqlTradeResult  result  = {};
        
        request.action       = TRADE_ACTION_DEAL;
        request.symbol       = symbol;
        request.volume       = NormalizeDouble(volume, 2);
        request.type         = ORDER_TYPE_SELL;
        request.price        = SymbolInfoDouble(symbol, SYMBOL_BID);
        request.sl           = slPrice > 0 ? NormalizeDouble(slPrice, _Digits) : 0;
        request.tp           = tpPrice > 0 ? NormalizeDouble(tpPrice, _Digits) : 0;
        request.deviation    = 10;
        request.magic        = m_magicNumber;
        request.comment      = "QuantumTrade";
        request.type_filling = GetFillingMode(symbol);
        
        if(!OrderSend(request, result))
        {
            Print(m_logPrefix, " SELL failed: ", GetLastError(), ", retcode=", result.retcode);
            return false;
        }
        
        Print(m_logPrefix, " SELL executed: ", symbol, ", Lots=", volume, ", Price=", result.price, ", Ticket=", result.order);
        return true;
    }
    
    // Close specific position
    bool ClosePosition(const ulong ticket)
    {
        if(!PositionSelectByTicket(ticket))
        {
            Print(m_logPrefix, " Position not found: ", ticket);
            return false;
        }
        
        string symbol = PositionGetString(POSITION_SYMBOL);
        double volume = PositionGetDouble(POSITION_VOLUME);
        ENUM_POSITION_TYPE posType = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
        
        MqlTradeRequest request = {};
        MqlTradeResult  result  = {};
        
        request.action       = TRADE_ACTION_DEAL;
        request.symbol       = symbol;
        request.volume       = volume;
        request.type         = (posType == POSITION_TYPE_BUY) ? ORDER_TYPE_SELL : ORDER_TYPE_BUY;
        request.price        = (posType == POSITION_TYPE_BUY) 
                                ? SymbolInfoDouble(symbol, SYMBOL_BID) 
                                : SymbolInfoDouble(symbol, SYMBOL_ASK);
        request.deviation    = 10;
        request.magic        = m_magicNumber;
        request.comment      = "QuantumTrade Close";
        request.type_filling = GetFillingMode(symbol);
        
        if(!OrderSend(request, result))
        {
            Print(m_logPrefix, " Close failed: ", GetLastError());
            return false;
        }
        
        Print(m_logPrefix, " Closed position: ", ticket, ", Profit=", result.price);
        return true;
    }
    
    // Close all positions for a symbol
    bool CloseAllForSymbol(const string symbol)
    {
        bool success = true;
        for(int i = 0; i < PositionsTotal(); i++)
        {
            ulong ticket = PositionGetTicket(i);
            if(PositionGetString(POSITION_SYMBOL) == symbol)
            {
                if(!ClosePosition(ticket))
                    success = false;
            }
        }
        return success;
    }
    
    // Close ALL positions
    void CloseAllPositions()
    {
        Print(m_logPrefix, " Closing ALL positions...");
        for(int i = PositionsTotal() - 1; i >= 0; i--)
        {
            ulong ticket = PositionGetTicket(i);
            ClosePosition(ticket);
        }
    }
    
    // Check if position exists for symbol
    bool HasPosition(const string symbol)
    {
        for(int i = 0; i < PositionsTotal(); i++)
        {
            ulong ticket = PositionGetTicket(i);
            if(PositionGetString(POSITION_SYMBOL) == symbol)
                return true;
        }
        return false;
    }
    
    // Get number of open positions managed by this EA
    int GetManagedPositionCount()
    {
        int count = 0;
        for(int i = 0; i < PositionsTotal(); i++)
        {
            ulong ticket = PositionGetTicket(i);
            if(PositionGetInteger(POSITION_MAGIC) == m_magicNumber)
                count++;
        }
        return count;
    }
    
private:
    // Determine the best order filling mode for a symbol
    ENUM_ORDER_TYPE_FILLING GetFillingMode(const string symbol)
    {
        uint fill = (uint)SymbolInfoInteger(symbol, SYMBOL_FILLING_MODE);
        
        if((fill & SYMBOL_FILLING_FOK) == SYMBOL_FILLING_FOK)
            return ORDER_FILLING_FOK;
        
        if((fill & SYMBOL_FILLING_IOC) == SYMBOL_FILLING_IOC)
            return ORDER_FILLING_IOC;
        
        return ORDER_FILLING_RETURN;
    }
};
