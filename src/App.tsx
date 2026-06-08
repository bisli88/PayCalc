import { Toaster, toast } from "sonner";
import { useState, useMemo } from "react";

// ── Helper Functions ────────────────────────────────────────
function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("he-IL", { 
    style: "currency", 
    currency: "ILS", 
    maximumFractionDigits: 0 
  }).format(n);
}

// ══════════════════════════════════════════════════════════════
export default function App() {
  return (
    <div dir="rtl" className="min-h-screen" style={{ 
      background: "linear-gradient(180deg, #0a0a0f 0%, #0f0e17 100%)",
      color: "var(--text-primary)", 
      fontFamily: "'Inter', 'Heebo', sans-serif",
      paddingBottom: "80px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Heebo:wght@300;400;500;600;700;800;900&display=swap');
        :root {
          --bg: #0f0e17;
          --surface: rgba(26, 24, 37, 0.6);
          --surface-solid: #1a1825;
          --surface2: rgba(35, 31, 53, 0.4);
          --border: rgba(124, 106, 245, 0.12);
          --accent: #7c6af5;
          --accent-glow: rgba(124, 106, 245, 0.25);
          --success: #3ecf8e;
          --success-glow: rgba(62, 207, 142, 0.2);
          --text-primary: #fffffe;
          --text-secondary: #a7a3c0;
          --text-muted: #6b6780;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        input, select, textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--surface-solid); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        
        .card { 
          background: var(--surface);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border); 
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .card2 { 
          background: var(--surface2);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border); 
          border-radius: 16px;
        }
        .btn-primary { 
          background: linear-gradient(135deg, var(--accent) 0%, #9b87f5 100%);
          color: #fff; 
          border: none; 
          border-radius: 14px; 
          padding: 16px 24px; 
          font-family: inherit; 
          font-weight: 700; 
          font-size: 16px; 
          cursor: pointer; 
          transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          box-shadow: 0 4px 16px var(--accent-glow);
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          opacity: 0;
          transition: opacity .2s;
        }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover { 
          transform: translateY(-2px);
          box-shadow: 0 6px 24px var(--accent-glow);
        }
        .btn-primary:active { 
          transform: translateY(0);
        }
        .btn-primary:disabled { 
          opacity: 0.4; 
          cursor: not-allowed;
          transform: none;
        }
        
        .input { 
          background: var(--surface2);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid var(--border); 
          border-radius: 14px; 
          padding: 16px 18px; 
          color: var(--text-primary); 
          font-size: 16px; 
          width: 100%; 
          outline: none; 
          transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
        }
        .input:focus { 
          border-color: var(--accent);
          background: rgba(35, 31, 53, 0.8);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .input::placeholder { color: var(--text-muted); }
        
        .fade-in { animation: fadeIn .4s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeIn { 
          from { opacity:0; transform: translateY(12px); } 
          to { opacity:1; transform:none; } 
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          .input, .btn-primary { font-size: 16px !important; }
        }
      `}</style>

      <MainApp />

      <Toaster position="top-center" theme="dark" />
    </div>
  );
}


// ── Main App ────────────────────────────────────────────────
type View = "calculator" | "breakdown";
type Calculation = {
  startTime: string;
  endTime: string;
  hourlyRate: number;
  hours: number;
  minutes: number;
  total: number;
};

function MainApp() {
  const [view, setView] = useState<View>("calculator");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("");
  const [hourlyRate, setHourlyRate] = useState("35");
  const [lastCalculation, setLastCalculation] = useState<Calculation | null>(null);

  const handleCalculate = (calc: Calculation) => {
    setLastCalculation(calc);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Content */}
      <main style={{ 
        flex: 1, 
        width: "100%", 
        maxWidth: 600,
        margin: "0 auto",
        padding: "24px 16px"
      }}>
        {view === "calculator" && (
          <Calculator 
            startTime={startTime}
            endTime={endTime}
            hourlyRate={hourlyRate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onHourlyRateChange={setHourlyRate}
            onCalculate={handleCalculate}
          />
        )}
        {view === "breakdown" && (
          <Breakdown calculation={lastCalculation} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentView={view} onViewChange={setView} />
    </div>
  );
}

// ── Bottom Navigation ───────────────────────────────────────
function BottomNav({ currentView, onViewChange }: { 
  currentView: View; 
  onViewChange: (v: View) => void 
}) {
  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "var(--surface-solid)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid var(--border)",
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
      zIndex: 100,
      boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.3)"
    }}>
      <NavButton 
        active={currentView === "calculator"}
        onClick={() => onViewChange("calculator")}
        icon={<HomeIcon />}
        label="ראשי"
      />
      <NavButton 
        active={currentView === "breakdown"}
        onClick={() => onViewChange("breakdown")}
        icon={<ChartIcon />}
        label="פירוט חישוב"
      />
    </nav>
  );
}

function NavButton({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button onClick={onClick} style={{
      background: "transparent",
      border: "none",
      color: active ? "var(--accent)" : "var(--text-muted)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      padding: "10px 32px",
      cursor: "pointer",
      transition: "all .3s cubic-bezier(0.4, 0, 0.2, 1)",
      fontFamily: "inherit",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.3px",
      position: "relative"
    }}>
      <div style={{ 
        transform: active ? "scale(1)" : "scale(0.95)",
        transition: "transform .3s cubic-bezier(0.4, 0, 0.2, 1)",
        filter: active ? "drop-shadow(0 2px 8px var(--accent-glow))" : "none"
      }}>
        {icon}
      </div>
      <span style={{ 
        opacity: active ? 1 : 0.7,
        transition: "opacity .2s"
      }}>
        {label}
      </span>
      {active && (
        <div style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 32,
          height: 3,
          background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
          borderRadius: "0 0 3px 3px"
        }} />
      )}
    </button>
  );
}

// ── Icons ───────────────────────────────────────────────────
function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  );
}

// ── Calculator ──────────────────────────────────────────────
function Calculator({ startTime, endTime, hourlyRate, onStartTimeChange, onEndTimeChange, onHourlyRateChange, onCalculate }: { 
  startTime: string;
  endTime: string;
  hourlyRate: string;
  onStartTimeChange: (v: string) => void;
  onEndTimeChange: (v: string) => void;
  onHourlyRateChange: (v: string) => void;
  onCalculate: (calc: Calculation) => void;
}) {
  const calculation = useMemo(() => {
    if (!startTime || !endTime || !hourlyRate) return null;
    
    const hours = calcHours(startTime, endTime);
    const minutes = Math.round(hours * 60);
    const rate = parseFloat(hourlyRate);
    const total = hours * rate;

    return {
      startTime,
      endTime,
      hourlyRate: rate,
      hours,
      minutes,
      total
    };
  }, [startTime, endTime, hourlyRate]);

  const handleCalculate = () => {
    if (!calculation) {
      toast.error("נא למלא את כל השדות");
      return;
    }
    if (calculation.hours <= 0) {
      toast.error("שעת הסיום חייבת להיות אחרי שעת ההתחלה");
      return;
    }
    onCalculate(calculation);
    toast.success("החישוב בוצע בהצלחה!");
  };

  return (
    <div className="fade-in">
      {/* Logo/Title */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: 32,
        paddingTop: 8
      }}>
        <h1 style={{ 
          fontSize: 28, 
          fontWeight: 800, 
          marginBottom: 6,
          letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          חישוב שעות עבודה
        </h1>
        <p style={{
          color: "var(--text-secondary)",
          fontSize: 14,
          fontWeight: 500
        }}>
          הזן את פרטי המשמרת שלך
        </p>
      </div>

      {/* Main Calculator Card */}
      <div className="card" style={{ padding: "28px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Start Time */}
          <div>
            <label style={{ 
              fontSize: 13, 
              color: "var(--text-secondary)", 
              display: "block", 
              marginBottom: 10,
              fontWeight: 600,
              letterSpacing: "0.3px"
            }}>
              שעת התחלה
            </label>
            <input 
              className="input" 
              type="time" 
              value={startTime} 
              onChange={e => onStartTimeChange(e.target.value)}
              style={{ fontSize: 18, maxWidth: "100%", minWidth: 0 }}
            />
          </div>

          {/* End Time */}
          <div>
            <label style={{ 
              fontSize: 13, 
              color: "var(--text-secondary)", 
              display: "block", 
              marginBottom: 10,
              fontWeight: 600,
              letterSpacing: "0.3px"
            }}>
              שעת סיום
            </label>
            <input 
              className="input" 
              type="time" 
              value={endTime} 
              onChange={e => onEndTimeChange(e.target.value)}
              style={{ fontSize: 18, maxWidth: "100%", minWidth: 0 }}
            />
          </div>

          {/* Hourly Rate */}
          <div>
            <label style={{ 
              fontSize: 13, 
              color: "var(--text-secondary)", 
              display: "block", 
              marginBottom: 10,
              fontWeight: 600,
              letterSpacing: "0.3px"
            }}>
              תשלום לשעה (₪)
            </label>
            <input 
              className="input" 
              type="number" 
              placeholder="35"
              value={hourlyRate} 
              onChange={e => onHourlyRateChange(e.target.value)}
              style={{ fontSize: 18 }}
            />
          </div>
        </div>
      </div>

      {/* Result Preview */}
      {calculation && calculation.hours > 0 && (
        <div className="card fade-in" style={{ 
          padding: "28px 24px", 
          marginBottom: 20,
          background: "linear-gradient(135deg, rgba(62, 207, 142, 0.08) 0%, rgba(124, 106, 245, 0.08) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--success)",
          boxShadow: "0 8px 32px var(--success-glow)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ 
              color: "var(--text-secondary)", 
              fontSize: 12, 
              fontWeight: 700,
              marginBottom: 12,
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>
              סכום לתשלום
            </div>
            <div style={{ 
              fontSize: 56, 
              fontWeight: 900, 
              color: "var(--success)",
              lineHeight: 1,
              letterSpacing: "-1px",
              textShadow: "0 4px 16px var(--success-glow)"
            }}>
              {formatMoney(calculation.total)}
            </div>
          </div>

          <div style={{ 
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            paddingTop: 20,
            borderTop: "1px solid rgba(124, 106, 245, 0.15)"
          }}>
            <div style={{ 
              textAlign: "center",
              padding: "12px",
              background: "var(--surface2)",
              borderRadius: 12,
              border: "1px solid var(--border)"
            }}>
              <div style={{ 
                color: "var(--text-muted)", 
                fontSize: 11, 
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase"
              }}>
                שעות
              </div>
              <div style={{ 
                fontWeight: 800, 
                color: "var(--accent)", 
                fontSize: 20 
              }}>
                {calculation.hours.toFixed(2)}
              </div>
            </div>
            <div style={{ 
              textAlign: "center",
              padding: "12px",
              background: "var(--surface2)",
              borderRadius: 12,
              border: "1px solid var(--border)"
            }}>
              <div style={{ 
                color: "var(--text-muted)", 
                fontSize: 11, 
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase"
              }}>
                דקות
              </div>
              <div style={{ 
                fontWeight: 800, 
                color: "var(--accent)", 
                fontSize: 20 
              }}>
                {calculation.minutes}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Button */}
      <button 
        className="btn-primary" 
        onClick={handleCalculate}
        disabled={!calculation || calculation.hours <= 0}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span>חשב תשלום</span>
          <span style={{ fontSize: 20 }}>💰</span>
        </span>
      </button>

      
    </div>  
  );       
}           


// ── Breakdown ───────────────────────────────────────────────
function Breakdown({ calculation }: { calculation: Calculation | null }) {
  if (!calculation) {
    return (
      <div className="fade-in" style={{ 
        textAlign: "center", 
        padding: "80px 20px",
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          width: 80,
          height: 80,
          margin: "0 auto 24px",
          background: "var(--surface2)",
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--border)"
        }}>
          <ChartIcon />
        </div>
        <h2 style={{ 
          fontSize: 22, 
          fontWeight: 800, 
          marginBottom: 10,
          letterSpacing: "-0.3px"
        }}>
          אין חישוב זמין
        </h2>
        <p style={{ 
          color: "var(--text-secondary)", 
          fontSize: 15,
          fontWeight: 500,
          maxWidth: 280
        }}>
          בצע חישוב בעמוד הראשי כדי לראות פירוט מפורט
        </p>
      </div>
    );
  }

  const hoursFromMinutes = (calculation.minutes / 60).toFixed(2);

  return (
    <div className="fade-in" style={{ paddingTop: 16 }}>
      <h2 style={{ 
        fontSize: 26, 
        fontWeight: 800, 
        marginBottom: 24,
        textAlign: "center",
        letterSpacing: "-0.5px"
      }}>
        פירוט החישוב
      </h2>

      {/* Summary Card */}
      <div className="card" style={{ 
        padding: "28px 24px", 
        marginBottom: 24,
        background: "linear-gradient(135deg, rgba(62, 207, 142, 0.08) 0%, rgba(124, 106, 245, 0.08) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--success)",
        boxShadow: "0 8px 32px var(--success-glow)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ 
            fontSize: 12, 
            color: "var(--text-secondary)", 
            marginBottom: 12,
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase"
          }}>
            סה"כ לתשלום
          </div>
          <div style={{ 
            fontSize: 56, 
            fontWeight: 900, 
            color: "var(--success)",
            lineHeight: 1,
            letterSpacing: "-1px",
            textShadow: "0 4px 16px var(--success-glow)"
          }}>
            {formatMoney(calculation.total)}
          </div>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: 16,
          paddingTop: 20,
          borderTop: "1px solid rgba(124, 106, 245, 0.15)"
        }}>
          <InfoBox label="שעת התחלה" value={calculation.startTime} />
          <InfoBox label="שעת סיום" value={calculation.endTime} />
        </div>
      </div>

      {/* Breakdown Steps */}
      <div className="card" style={{ padding: "24px 20px" }}>
        <h3 style={{ 
          fontSize: 15, 
          fontWeight: 700, 
          marginBottom: 20,
          color: "var(--text-secondary)",
          letterSpacing: "0.5px"
        }}>
          פירוט תרגיל:
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Step 1 */}
          <BreakdownStep
            number={1}
            title="סה״כ דקות"
            formula={`${calculation.minutes} דקות`}
            description="המרת זמן העבודה לדקות"
          />

          {/* Step 2 */}
          <BreakdownStep
            number={2}
            title="סה״כ שעות"
            formula={`${calculation.minutes} ÷ 60 = ${hoursFromMinutes} שעות`}
            description="המרת הדקות לשעות"
          />

          {/* Step 3 */}
          <BreakdownStep
            number={3}
            title="חישוב תשלום"
            formula={`${hoursFromMinutes} × ${calculation.hourlyRate}₪ = ${formatMoney(calculation.total)}`}
            description="הכפלת שעות בתשלום לשעה"
            highlight
          />
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ 
      textAlign: "center",
      padding: "14px",
      background: "var(--surface2)",
      borderRadius: 12,
      border: "1px solid var(--border)"
    }}>
      <div style={{ 
        fontSize: 11, 
        color: "var(--text-muted)", 
        marginBottom: 8,
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase"
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: 22, 
        fontWeight: 800, 
        color: "var(--text-primary)" 
      }}>
        {value}
      </div>
    </div>
  );
}

function BreakdownStep({ number, title, formula, description, highlight }: {
  number: number;
  title: string;
  formula: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className="card2" style={{ 
      padding: "18px 20px",
      background: highlight 
        ? "linear-gradient(135deg, rgba(62, 207, 142, 0.12) 0%, rgba(124, 106, 245, 0.12) 100%)" 
        : "var(--surface2)",
      border: highlight ? "1.5px solid var(--success)" : "1px solid var(--border)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: highlight 
            ? "linear-gradient(135deg, var(--success) 0%, #2db87a 100%)"
            : "linear-gradient(135deg, var(--accent) 0%, #9b87f5 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 800,
          flexShrink: 0,
          boxShadow: highlight 
            ? "0 4px 12px var(--success-glow)"
            : "0 4px 12px var(--accent-glow)"
        }}>
          {number}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: 12, 
            fontWeight: 700, 
            color: highlight ? "var(--success)" : "var(--accent)",
            marginBottom: 8,
            letterSpacing: "0.3px"
          }}>
            {title}
          </div>
          <div style={{ 
            fontSize: 16, 
            fontWeight: 700, 
            marginBottom: 6,
            fontFamily: "'Courier New', monospace",
            direction: "ltr",
            textAlign: "right",
            color: "var(--text-primary)"
          }}>
            {formula}
          </div>
          <div style={{ 
            fontSize: 12, 
            color: "var(--text-secondary)",
            fontWeight: 500
          }}>
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}