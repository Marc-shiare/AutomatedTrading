#property copyright "QuantumTrade"
#property link      "https://quantumtrade.io"
#property version   "1.00"
#property strict

#include <Zmq/Zmq.mqh>
#include "QuantumTrade_JSON.mqh"
#include "QuantumTrade_Trade.mqh"

// ── Input Parameters ──
input group "=== Connection Settings ==="
input string   ZMQ_SERVER_HOST  = "localhost";
input int      ZMQ_SERVER_PORT  = 5555;
input int      HEARTBEAT_INTERVAL_MS = 5000;

input group "=== Strategy Parameters ==="
input string   STRATEGY_NAME    = "momentum_breakout";
input string   SYMBOL           = "EURUSD";
input ENUM_TIMEFRAMES TIMEFRAME = PERIOD_M10;
input int      FAST_MA          = 12;
input int      SLOW_MA          = 26;
input double   RSI_THRESHOLD    = 65.0;
input double   STOP_LOSS_PIPS   = 25.0;
input double   TAKE_PROFIT_PIPS = 50.0;
input double   RISK_PERCENT     = 2.0;

// ── Global Variables ──
Context        zmqContext;
Socket         zmqSubscriber;
Socket         zmqPublisher;
TradeManager   tradeManager;

string         serverAddress;
bool           isRunning      = false;
int            connectionAttempts = 0;
const int      MAX_RECONNECT_ATTEMPTS = 10;

// ── Event Handlers ──
int OnInit()
{
    serverAddress = "tcp://" + ZMQ_SERVER_HOST + ":" + IntegerToString(ZMQ_SERVER_PORT);
    
    Print("QuantumTrade EA initializing...");
    Print("Server address: ", serverAddress);
    
    if(!InitializeZMQ())
    {
        Print("ZMQ initialization failed. EA will retry on next tick.");
        return(INIT_SUCCEEDED); // Will retry via OnTick
    }
    
    isRunning = true;
    Print("QuantumTrade EA initialized successfully.");
    
    // Send initial heartbeat
    SendHeartbeat();
    
    return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
    Print("QuantumTrade EA shutting down... reason=", reason);
    isRunning = false;
    DeinitializeZMQ();
}

void OnTick()
{
    if(!isRunning)
        return;
    
    // Process incoming commands from FastAPI
    ProcessZeroMQueue();
    
    // Run strategy logic
    ExecuteStrategy();
    
    // Send periodic heartbeat
    static datetime lastHeartbeat = 0;
    if(TimeCurrent() - lastHeartbeat > HEARTBEAT_INTERVAL_MS / 1000)
    {
        SendHeartbeat();
        lastHeartbeat = TimeCurrent();
    }
}

// ── Strategy Implementation ──
void ExecuteStrategy()
{
    // Skip if market is closed or data unavailable
    if(TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) == 0)
        return;
    
    double fastMA = iMA(SYMBOL, TIMEFRAME, FAST_MA, 0, MODE_SMA, PRICE_CLOSE, 0);
    double slowMA = iMA(SYMBOL, TIMEFRAME, SLOW_MA, 0, MODE_SMA, PRICE_CLOSE, 0);
    double rsiValue = iRSI(SYMBOL, TIMEFRAME, 14, PRICE_CLOSE, 0);
    
    double close = iClose(SYMBOL, TIMEFRAME, 0);
    
    bool maBullish = (fastMA > slowMA);
    bool rsiCondition = (rsiValue > RSI_THRESHOLD);
    
    // Entry logic
    if(maBullish && rsiCondition)
    {
        if(!tradeManager.HasPosition(SYMBOL))
        {
            double lotSize = CalculateLotSize();
            double slPrice = close - STOP_LOSS_PIPS * _Point;
            double tpPrice = close + TAKE_PROFIT_PIPS * _Point;
            
            tradeManager.OpenBuy(SYMBOL, lotSize, slPrice, tpPrice);
            
            // Log trade to FastAPI
            json tradeLog;
            tradeLog["action"] = "trade_executed";
            tradeLog["symbol"] = SYMBOL;
            tradeLog["side"] = "BUY";
            tradeLog["lot_size"] = lotSize;
            tradeLog["entry_price"] = close;
            tradeLog["sl_pips"] = STOP_LOSS_PIPS;
            tradeLog["tp_pips"] = TAKE_PROFIT_PIPS;
            tradeLog["timestamp"] = TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS);
            
            SendToServer(tradeLog.ToString());
        }
    }
}

// ── ZeroMQ Communication ──
bool InitializeZMQ()
{
    if(ZmqDllExists() == false)
    {
        Print("ZMQ DLL not found. Please install ZeroMQ library.");
        return false;
    }
    
    zmqSubscriber = new Socket(zmqContext, ZMQ_PUSH);
    zmqPublisher   = new Socket(zmqContext, ZMQ_PULL);
    
    // Non-blocking mode for message processing
    zmqSubscriber.setSendHighWaterMark(1000);
    zmqPublisher.setReceiveHighWaterMark(1000);
    zmqPublisher.setReceiveTimeout(200); // 200ms non-blocking
    
    if(!zmqSubscriber.connect(serverAddress))
    {
        Print("Failed to connect ZMQ PUSH socket.");
        return false;
    }
    
    if(!zmqPublisher.bind("tcp://*:" + IntegerToString(ZMQ_SERVER_PORT + 1)))
    {
        Print("Failed to bind ZMQ PULL socket.");
        return false;
    }
    
    Print("ZeroMQ initialized. Connected to ", serverAddress);
    return true;
}

void DeinitializeZMQ()
{
    Print("Shutting down ZeroMQ...");
    
    if(zmqSubscriber != NULL)
    {
        zmqSubscriber.disconnect(serverAddress);
        delete zmqSubscriber;
        zmqSubscriber = NULL;
    }
    
    if(zmqPublisher != NULL)
    {
        zmqPublisher.unbind("tcp://*:" + IntegerToString(ZMQ_SERVER_PORT + 1));
        delete zmqPublisher;
        zmqPublisher = NULL;
    }
    
    Print("ZeroMQ shutdown complete.");
}

void ProcessZeroMQueue()
{
    if(zmqPublisher == NULL)
        return;
    
    string message;
    while(zmqPublisher.recv(message, true) > 0)
    {
        HandleCommand(message);
    }
}

void HandleCommand(const string& cmd)
{
    json j;
    if(!j.Parse(cmd))
    {
        Print("Failed to parse command: ", cmd);
        return;
    }
    
    string action = j["action"].ToStr();
    
    if(action == "update_params")
    {
        UpdateStrategyParameters(j);
    }
    else if(action == "stop_trading")
    {
        isRunning = false;
        tradeManager.CloseAllPositions();
        Print("Trading stopped by command.");
    }
    else if(action == "start_trading")
    {
        isRunning = true;
        Print("Trading started by command.");
    }
    else if(action == "emergency_close")
    {
        tradeManager.CloseAllPositions();
        isRunning = false;
        Print("EMERGENCY: All positions closed.");
    }
    else if(action == "get_account_info")
    {
        SendAccountInfo();
    }
}

void SendToServer(const string& message)
{
    if(zmqSubscriber != NULL)
    {
        zmqSubscriber.send(message);
    }
}

void SendHeartbeat()
{
    json heartbeat;
    heartbeat["action"] = "heartbeat";
    heartbeat["timestamp"] = TimeToString(TimeCurrent(), TIME_DATE|TIME_SECONDS);
    heartbeat["account_balance"] = AccountInfoDouble(ACCOUNT_BALANCE);
    heartbeat["account_equity"] = AccountInfoDouble(ACCOUNT_EQUITY);
    heartbeat["open_positions"] = PositionsTotal();
    heartbeat["is_running"] = isRunning;
    
    SendToServer(heartbeat.ToString());
}

void SendAccountInfo()
{
    json accountInfo;
    accountInfo["action"] = "account_info";
    accountInfo["login"] = AccountInfoInteger(ACCOUNT_LOGIN);
    accountInfo["server"] = AccountInfoString(ACCOUNT_SERVER);
    accountInfo["currency"] = AccountInfoString(ACCOUNT_CURRENCY);
    accountInfo["leverage"] = AccountInfoInteger(ACCOUNT_LEVERAGE);
    accountInfo["balance"] = AccountInfoDouble(ACCOUNT_BALANCE);
    accountInfo["equity"] = AccountInfoDouble(ACCOUNT_EQUITY);
    accountInfo["margin"] = AccountInfoDouble(ACCOUNT_MARGIN);
    accountInfo["free_margin"] = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
    accountInfo["profit"] = AccountInfoDouble(ACCOUNT_PROFIT);
    
    SendToServer(accountInfo.ToString());
}

// ── Strategy Parameter Management ──
void UpdateStrategyParameters(const json& params)
{
    // Update input parameters from JSON config
    // Note: In MQL5, input variables are read-only after init,
    // so we use global variables for runtime updates
    
    if(params.Contains("fast_ma"))
    {
        // FastMA is input var, cannot be changed directly
        // Would need to restart EA for true config change
        // For now, log the received parameters
        Print("Received parameter update: ", params.ToString());
    }
}

// ── Risk Management ──
double CalculateLotSize()
{
    double accountBalance = AccountInfoDouble(ACCOUNT_BALANCE);
    double riskAmount = accountBalance * RISK_PERCENT / 100.0;
    
    double pipValue = SymbolInfoDouble(SYMBOL, SYMBOL_TRADE_TICK_VALUE);
    double lotStep = SymbolInfoDouble(SYMBOL, SYMBOL_VOLUME_STEP);
    double minLot = SymbolInfoDouble(SYMBOL, SYMBOL_VOLUME_MIN);
    double maxLot = SymbolInfoDouble(SYMBOL, SYMBOL_VOLUME_MAX);
    
    if(pipValue <= 0)
    {
        Print("Warning: Pip value is zero. Using minimum lot.");
        return minLot;
    }
    
    double lots = riskAmount / (STOP_LOSS_PIPS * pipValue);
    
    // Round to lot step
    lots = MathFloor(lots / lotStep) * lotStep;
    
    // Clamp to min/max
    lots = MathMax(minLot, MathMin(maxLot, lots));
    
    return NormalizeDouble(lots, 2);
}

// ── Helper Methods ──
string TimeToSqlString(datetime t)
{
    return TimeToString(t, TIME_DATE|TIME_SECONDS);
}
