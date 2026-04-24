import React from "react";
import { getStoredUsername } from "../../api/auth";

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export default function Topbar({ title, subtitle, actions }: Props) {
  const username = getStoredUsername();

  return (
    <div className="pm-topbar">
      <div className="pm-topbar-content">
        {username && <div className="pm-topbar-greeting">Welcome, {username}</div>}
        <div className="pm-topbar-title">{title}</div>
        {subtitle && <div className="pm-topbar-sub">{subtitle}</div>}
      </div>
      {actions && <div className="pm-topbar-actions">{actions}</div>}
    </div>
  );
}