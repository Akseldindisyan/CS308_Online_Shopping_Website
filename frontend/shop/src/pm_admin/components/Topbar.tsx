type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export default function Topbar({ title, subtitle, actions }: Props) {
  return (
    <div className="pm-topbar">
      <div>
        <div className="pm-topbar-title">{title}</div>
        {subtitle && <div className="pm-topbar-sub">{subtitle}</div>}
      </div>
      {actions && <div className="pm-topbar-actions">{actions}</div>}
    </div>
  );
}