type Props = { compact?: boolean };

export function AdrianoLogo({ compact = false }: Props) {
  return (
    <div className={`adriano-logo ${compact ? "compact" : ""}`} aria-label="ADRIANO">
      {!compact && <span className="logo-word">ADRIANO</span>}
      <span className="logo-grid" aria-hidden="true"><i/><i/><i/><i/></span>
    </div>
  );
}
