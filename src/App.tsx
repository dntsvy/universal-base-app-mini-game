import React, { useEffect, useRef, useState } from "react";

// ---- Types ----

type Role = "creator" | "developer" | "miniapp" | "ai";

type AppUnit = {
  id: string;
  name: string;
  role: Role;
  baseCost: number; // ใช้ Fund ซื้อ
  scaling: number; // ราคาเพิ่มขึ้นทุกครั้ง
  baseUsersPerSec: number; // users/sec
  count: number;
  unlockFund: number; // ปลดล็อกเมื่อ Fund ถึง
};

type FundingStage = {
  id: string;
  name: string;
  minFund: number;
  bonus: number; // multipler สำหรับ users/sec & baseposting
};

type Sector = {
  id: string;
  name: string;
  description: string;
  requirementFund: number;
  requirementPrestige: number;
};

type GameState = {
  users: number;
  fund: number;
  units: AppUnit[];
  stageIndex: number;
  prestigeLevel: number;
  competitorUsers: number;
};

// ---- Data config ----

const FUNDING_STAGES: FundingStage[] = [
  { id: "boot", name: "Bootstrapped", minFund: 0, bonus: 1 },
  { id: "seed", name: "Seed Round", minFund: 1000, bonus: 1.2 },
  { id: "seriesA", name: "Series A", minFund: 10000, bonus: 1.5 },
  { id: "seriesB", name: "Series B", minFund: 100000, bonus: 2 },
  { id: "unicorn", name: "Unicorn", minFund: 1000000, bonus: 3 },
];

const INITIAL_UNITS: AppUnit[] = [
  {
    id: "creator_junior",
    name: "Creator Studio",
    role: "creator",
    baseCost: 40,
    scaling: 1.12,
    baseUsersPerSec: 5,
    count: 0,
    unlockFund: 0,
  },
  {
    id: "dev_core",
    name: "Developer Hub",
    role: "developer",
    baseCost: 300,
    scaling: 1.15,
    baseUsersPerSec: 15,
    count: 0,
    unlockFund: 200,
  },
  {
    id: "miniapp_lab",
    name: "Miniapp Factory",
    role: "miniapp",
    baseCost: 1200,
    scaling: 1.17,
    baseUsersPerSec: 60,
    count: 0,
    unlockFund: 800,
  },
  {
    id: "ai_agent_swarm",
    name: "AI Agent Lab",
    role: "ai",
    baseCost: 6000,
    scaling: 1.2,
    baseUsersPerSec: 250,
    count: 0,
    unlockFund: 4000,
  },
];

const SECTORS: Sector[] = [
  {
    id: "local",
    name: "Base Community",
    description: "Start posting on Base. Find your first 1,000 believers.",
    requirementFund: 0,
    requirementPrestige: 0,
  },
  {
    id: "launchpad",
    name: "Startup Launch Pad",
    description: "Secure early funding and launch your first Base App.",
    requirementFund: 1000,
    requirementPrestige: 0,
  },
  {
    id: "network",
    name: "Base Network Expansion",
    description: "Multiple apps, thousands of users, devs joining daily.",
    requirementFund: 10000,
    requirementPrestige: 0,
  },
  {
    id: "empire",
    name: "Business Empire",
    description: "You’re a category leader. Everything runs on your stack.",
    requirementFund: 50000,
    requirementPrestige: 1,
  },
  {
    id: "global",
    name: "Global Everything App",
    description: "IPO done. You compete with legacy giants worldwide.",
    requirementFund: 200000,
    requirementPrestige: 2,
  },
  {
    id: "universal",
    name: "Universal Baseverse",
    description: "Your app is the interface for the entire universe.",
    requirementFund: 1000000,
    requirementPrestige: 3,
  },
];

// ---- Utils ----

function formatNumber(n: number): string {
  if (!isFinite(n)) return "∞";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(0);
}

type ConsoleLogProps = {
  logs: string[];
};

const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  const colorForTag = (line: string) => {
    const match = line.match(/\[(\w+)\]/);
    const tag = match ? match[1] : "";

    switch (tag) {
      case "BASEPOST":
        return "#0369ff"; // blue
      case "APP":
        return "#0ea5e9"; // cyan
      case "FUND":
        return "#eab308"; // yellow
      case "IPO":
        return "#22c55e"; // green
      case "SYSTEM":
        return "#e5e7eb"; // gray
      case "WARN":
        return "#f97373"; // red
      default:
        return "#e5e7eb";
    }
  };

  return (
    <div className="console-wrapper">
      <div className="console-header">
        <span className="console-title">UNIVERSAL BASE APP // CONSOLE</span>
        <div className="console-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
      </div>
      <div className="console-body" ref={ref}>
        {logs.length === 0 && (
          <div className="console-line" style={{ color: "#94a3b8" }}>
            [00:00] [SYSTEM] Awaiting first basepost…
          </div>
        )}
        {logs.map((line, i) => (
          <div
            key={i}
            className="console-line"
            style={{ color: colorForTag(line) }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Main App ----

const SAVE_KEY = "universal_base_app_save_v2";

const App: React.FC = () => {
  const [users, setUsers] = useState(0);
  const [fund, setFund] = useState(0); // ทุนบริษัท
  const [units, setUnits] = useState<AppUnit[]>(INITIAL_UNITS);
  const [stageIndex, setStageIndex] = useState(0);
  const [prestigeLevel, setPrestigeLevel] = useState(0);
  const [competitorUsers, setCompetitorUsers] = useState(2000);
  const [logs, setLogs] = useState<string[]>([
    "[00:00] [SYSTEM] Booting Universal Base App simulation…",
    "[00:00] [SYSTEM] Tip: Reach 40 Fund to hire your first Creator Studio.",
  ]);

  const currentStage = FUNDING_STAGES[stageIndex];
  const stageBonus = currentStage.bonus;

  // Prestige bonus: แต่ละ level +50% growth
  const prestigeBonus = 1 + prestigeLevel * 0.5;
  const growthBonus = stageBonus * prestigeBonus;

  // รายได้ต่อ user ที่เพิ่มขึ้นหนึ่งหน่วย
  const revenuePerUser = 0.2 * prestigeBonus;

  const pushLog = (tag: string, message: string) => {
    setLogs((prev) => {
      const now = new Date();
      const time = now.toTimeString().slice(0, 8);
      const line = `[${time}] [${tag}] ${message}`;
      const next = [...prev, line];
      if (next.length > 160) next.shift();
      return next;
    });
  };

  // โหลดเกมครั้งแรกจาก localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data: GameState = JSON.parse(raw);

      setUsers(data.users ?? 0);
      setFund(data.fund ?? 0);
      setUnits(data.units ?? INITIAL_UNITS);
      setStageIndex(data.stageIndex ?? 0);
      setPrestigeLevel(data.prestigeLevel ?? 0);
      setCompetitorUsers(data.competitorUsers ?? 2000);

      setLogs((prev) => [
        ...prev,
        "[00:00] [SYSTEM] Previous Base App session loaded.",
      ]);
    } catch (e) {
      console.warn("Failed to load save", e);
    }
  }, []);

  // Auto-save เมื่อ state หลักเปลี่ยน
  useEffect(() => {
    const state: GameState = {
      users,
      fund,
      units,
      stageIndex,
      prestigeLevel,
      competitorUsers,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }, [users, fund, units, stageIndex, prestigeLevel, competitorUsers]);

  // Users/sec จาก Base App ทั้งหมด
  const baseUsersRate = units.reduce(
    (sum, u) => sum + u.count * u.baseUsersPerSec,
    0
  );
  const totalUsersRate = baseUsersRate * growthBonus;

  // Market share
  const totalMarketUsers = users + competitorUsers;
  const marketShare =
    totalMarketUsers > 0 ? (users / totalMarketUsers) * 100 : 0;

  // tick: ทุก 1 วินาที เพิ่ม users & fund จากฐาน users/sec และคู่แข่งโตไปด้วย
  useEffect(() => {
    const interval = setInterval(() => {
      if (totalUsersRate > 0) {
        setUsers((prevUsers) => {
          const gained = totalUsersRate;
          const nextUsers = prevUsers + gained;
          const newFundFromUsers = gained * revenuePerUser;
          setFund((prevFund) => prevFund + newFundFromUsers);
          return nextUsers;
        });
      }

      // competitor growth: โตตาม stageIndex และ prestige (โลกพัฒนาไปด้วย)
      setCompetitorUsers((prev) => {
        const baseGrowth = 15 + stageIndex * 10 + prestigeLevel * 5;
        return prev + baseGrowth;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalUsersRate, stageIndex, prestigeLevel, revenuePerUser]);

  // Funding Stage: อัปเดตเมื่อ Fund เพิ่มขึ้น
  useEffect(() => {
    let nextStageIndex = stageIndex;
    for (let i = FUNDING_STAGES.length - 1; i >= 0; i--) {
      if (fund >= FUNDING_STAGES[i].minFund) {
        nextStageIndex = i;
        break;
      }
    }
    if (nextStageIndex !== stageIndex) {
      setStageIndex(nextStageIndex);
      const stage = FUNDING_STAGES[nextStageIndex];
      pushLog(
        "FUND",
        `Funding milestone reached → ${stage.name} (bonus x${stage.bonus.toFixed(
          2
        )}).`
      );
    }
  }, [fund, stageIndex]);

  const handleBasepost = () => {
    const gainedUsers = 8 * growthBonus;
    setUsers((prev) => {
      const next = prev + gainedUsers;
      pushLog(
        "BASEPOST",
        `Baseposting hits. +${gainedUsers.toFixed(
          0
        )} users (total: ${next.toFixed(0)}).`
      );
      return next;
    });

    setFund((prevFund) => prevFund + gainedUsers * revenuePerUser);
  };

  // ปุ่ม Pitch Investors: เอา traction ปัจจุบันไปเล่าให้นักลงทุน → ได้ Fund เพิ่ม
  const handlePitchInvestors = () => {
    if (users < 10) {
      pushLog(
        "WARN",
        "Investors want to see at least 10 users before listening to your pitch."
      );
      return;
    }

    const multiplier = 0.05 * growthBonus; // 5% ของ users ปรับตาม stage+prestige
    const raised = users * multiplier * revenuePerUser;

    setFund((prevFund) => prevFund + raised);
    pushLog(
      "FUND",
      `You pitch investors with ${formatNumber(
        users
      )} users. Raised ~${formatNumber(raised)} Fund.`
    );
  };

  // IPO / Prestige Reset
  const canIPO = fund >= 50000 && users >= 5000;

  const handleIPO = () => {
    if (!canIPO) {
      pushLog(
        "WARN",
        "IPO requires at least 5,000 users and 50,000 Fund. Keep building."
      );
      return;
    }

    setPrestigeLevel((prev) => prev + 1);
    setUsers(0);
    setFund(0);
    setUnits(INITIAL_UNITS.map((u) => ({ ...u, count: 0 })));
    setStageIndex(0);

    // คู่แข่งก็ evolve ตามเวลา แต่คุณไปเริ่มรอบใหม่แบบเทพกว่า
    setCompetitorUsers((prev) => prev * 0.6 + 5000);

    pushLog(
      "IPO",
      `IPO complete. Founder prestige increased to level ${
        prestigeLevel + 1
      }. All apps reset, but your Base App grows faster forever.`
    );
  };

  const getUnitCost = (u: AppUnit) =>
    Math.round(u.baseCost * Math.pow(u.scaling, u.count));

  const handleBuyUnit = (id: string) => {
    const unit = units.find((u) => u.id === id);
    if (!unit) return;

    const cost = getUnitCost(unit);

    if (fund < unit.unlockFund) {
      pushLog(
        "WARN",
        `${unit.name} unlocks at ${formatNumber(
          unit.unlockFund
        )} Fund. Keep building.`
      );
      return;
    }

    if (fund < cost) {
      pushLog(
        "WARN",
        `Not enough Fund to expand ${unit.name}. Need ${formatNumber(
          cost
        )} Fund.`
      );
      return;
    }

    setFund((prevFund) => {
      if (prevFund < unit.unlockFund || prevFund < cost) return prevFund;
      const next = prevFund - cost;
      return next < 0 ? 0 : next;
    });

    setUnits((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, count: u.count + 1 } : u
      )
    );

    pushLog(
      "APP",
      `${unit.name} hired/launched. +${unit.baseUsersPerSec} users/sec (total units: ${
        unit.count + 1
      }).`
    );
  };

  // Sector level calculation (Universe Map)
  const sectorIndex = (() => {
    let idx = 0;
    for (let i = 0; i < SECTORS.length; i++) {
      if (
        fund >= SECTORS[i].requirementFund &&
        prestigeLevel >= SECTORS[i].requirementPrestige
      ) {
        idx = i;
      }
    }
    return idx;
  })();

  return (
    <div className="app-root">
      <div className="game-card">
        {/* Header */}
        <div className="header-row">
          <div>
            <div className="game-title">UNIVERSAL BASE APP</div>
            <div className="game-subtitle">
              BUILT ON BASE · POWERED BY BUILDERS
            </div>
          </div>
          <div className="jesse-avatar">
            <div className="jesse-hair" />
            <div className="jesse-face" />
            <div className="jesse-cigar" />
          </div>
        </div>

        {/* Funding summary + prestige */}
        <div className="funding-banner">
          <div className="funding-stage">
            <span className="funding-label">FUNDING STAGE</span>
            <span className="funding-name">{currentStage.name}</span>
          </div>
          <div className="funding-detail">
            <span className="funding-label">GROWTH BONUS</span>
            <span className="funding-name">x{growthBonus.toFixed(2)}</span>
          </div>
          <div className="funding-detail">
            <span className="funding-label">FOUNDER PRESTIGE</span>
            <span className="funding-name">Lv {prestigeLevel}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-label">USERS (ONCHAIN)</div>
            <div className="stat-value">{formatNumber(users)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">BUSINESS FUND</div>
            <div className="stat-value">{formatNumber(fund)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">USERS / SEC</div>
            <div className="stat-value">
              {formatNumber(totalUsersRate || 0)}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">MARKET SHARE</div>
            <div className="stat-value">
              {marketShare.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Competitor info */}
        <div className="competitor-row">
          <span className="competitor-title">Legacy Apps</span>
          <span className="competitor-value">
            Users: {formatNumber(competitorUsers)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="action-row">
          <button className="boost-button" onClick={handleBasepost}>
            BASEPOSTING
          </button>
          <button
            className="secondary-button"
            onClick={handlePitchInvestors}
          >
            PITCH INVESTORS
          </button>
          <button
            className={`danger-button ${canIPO ? "" : "danger-button-disabled"}`}
            onClick={handleIPO}
          >
            IPO & RESET
          </button>
        </div>

        {/* Base App section */}
        <div className="shop-section">
          <div className="section-title">BASE APP</div>
          {units.map((u) => {
            const cost = getUnitCost(u);
            const unlocked = fund >= u.unlockFund;
            const affordable = unlocked && fund >= cost;

            return (
              <button
                key={u.id}
                onClick={() => handleBuyUnit(u.id)}
                className={`shop-item ${
                  affordable
                    ? "shop-item-ok"
                    : unlocked
                    ? "shop-item-no"
                    : "shop-item-locked"
                }`}
              >
                <div className="shop-item-main">
                  <div className="shop-item-name">
                    {u.name}{" "}
                    <span style={{ fontSize: 10, opacity: 0.7 }}>
                      ({u.role.toUpperCase()})
                    </span>
                  </div>
                  <div className="shop-item-desc">
                    +{u.baseUsersPerSec} users/sec · owned: {u.count}
                  </div>
                  {!unlocked && (
                    <div className="shop-item-desc">
                      Unlock at {formatNumber(u.unlockFund)} Fund
                    </div>
                  )}
                </div>
                <div className="shop-item-cost">
                  Cost: {formatNumber(cost)} Fund
                </div>
              </button>
            );
          })}
        </div>

        {/* Universe Map */}
        <div className="sector-map">
          <div className="sector-header">
            <span className="sector-title">UNIVERSE MAP</span>
            <span className="sector-subtitle">
              Sector {sectorIndex + 1}/{SECTORS.length}:{" "}
              {SECTORS[sectorIndex].name}
            </span>
          </div>
          <div className="sector-grid">
            {SECTORS.map((sector, idx) => {
              let status: "completed" | "active" | "locked" = "locked";
              if (idx < sectorIndex) status = "completed";
              else if (idx === sectorIndex) status = "active";

              return (
                <div
                  key={sector.id}
                  className={`sector-card sector-${status}`}
                >
                  <div className="sector-name">
                    {idx + 1}. {sector.name}
                  </div>
                  <div className="sector-desc">{sector.description}</div>
                  <div className="sector-req">
                    Req: {formatNumber(sector.requirementFund)} Fund ·
                    Prestige Lv {sector.requirementPrestige}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Console */}
        <ConsoleLog logs={logs} />
      </div>
    </div>
  );
};

export default App;
