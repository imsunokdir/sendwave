import type { CampaignSchedule } from "../../services/campaignService";

interface SchedulePickerProps {
  schedule: CampaignSchedule;
  onChange: (schedule: CampaignSchedule) => void;
}

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const pad = (n: number) => String(n).padStart(2, "0");

const formatSummaryTime = (hour: number, minute: number) => {
  const h = hour % 12 || 12;
  const m = pad(minute);
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:${m} ${ampm}`;
};

export default function SchedulePicker({
  schedule,
  onChange,
}: SchedulePickerProps) {
  const sendMinute = schedule.sendMinute ?? 0;

  const toggleDay = (day: number) => {
    const current = schedule.sendDays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    onChange({ ...schedule, sendDays: updated });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "HH:MM"
    if (!val) return;
    const [h, m] = val.split(":").map(Number);
    onChange({ ...schedule, sendHour: h, sendMinute: m });
  };

  const timeValue = `${pad(schedule.sendHour)}:${pad(sendMinute)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Send days */}
      <div>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            display: "block",
            marginBottom: 8,
          }}
        >
          Send on these days
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          {DAYS.map((day) => {
            const active = schedule.sendDays.includes(day.value);
            return (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  border: `1px solid ${active ? "#6366f1" : "#e5e7eb"}`,
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  background: active ? "#f5f3ff" : "#f9fafb",
                  color: active ? "#4f46e5" : "#6b7280",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Send time */}
      <div>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            display: "block",
            marginBottom: 8,
          }}
        >
          Send at (your local time)
        </label>
        <input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          style={{
            padding: "9px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 9,
            fontSize: 13,
            color: "#111827",
            background: "#f9fafb",
            outline: "none",
            fontFamily: "inherit",
            cursor: "pointer",
            transition: "border-color .15s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
        />
      </div>

      {/* Summary */}
      <div
        style={{
          background: "#f5f3ff",
          border: "1px solid #e0e7ff",
          borderRadius: 9,
          padding: "10px 14px",
        }}
      >
        <p
          style={{ fontSize: 12, color: "#4f46e5", margin: 0, fontWeight: 500 }}
        >
          📅 Emails will send on{" "}
          {schedule.sendDays.length === 0
            ? "no days selected"
            : DAYS.filter((d) => schedule.sendDays.includes(d.value))
                .map((d) => d.label)
                .join(", ")}{" "}
          at {formatSummaryTime(schedule.sendHour, sendMinute)}
        </p>
      </div>
    </div>
  );
}
