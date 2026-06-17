// src/components/ui/index.jsx
import { estadoInfo } from '../../utils/helpers';

const s = {
  // Botón primario
  btnPrimary: {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
    padding:'11px 20px', background:'var(--red)', border:'none',
    borderRadius:'var(--radius-sm)', color:'#fff',
    fontFamily:'var(--font-head)', fontWeight:700, fontSize:14,
    cursor:'pointer', transition:'var(--trans)', whiteSpace:'nowrap',
  },
  // Botón secundario
  btnSecondary: {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
    padding:'11px 20px', background:'var(--bg-3)',
    border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
    color:'var(--text-2)', fontFamily:'var(--font-head)', fontWeight:600,
    fontSize:14, cursor:'pointer', transition:'var(--trans)', whiteSpace:'nowrap',
  },
  // Ghost
  btnGhost: {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
    padding:'8px 14px', background:'transparent', border:'none',
    borderRadius:'var(--radius-sm)', color:'var(--text-2)',
    fontFamily:'var(--font-body)', fontWeight:500, fontSize:13.5,
    cursor:'pointer', transition:'var(--trans)',
  },
};

// ── Button ────────────────────────────────────────────────────
export function Button({ children, variant='primary', loading, disabled, onClick, type='button', style={}, fullWidth }) {
  const base = variant === 'primary' ? s.btnPrimary
             : variant === 'secondary' ? s.btnSecondary
             : s.btnGhost;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...base,
        ...(fullWidth ? { width:'100%' } : {}),
        ...(disabled || loading ? { opacity:0.55, cursor:'not-allowed' } : {}),
        ...style,
      }}
    >
      {loading && <span className="spinner" style={{ width:15, height:15 }} />}
      {children}
    </button>
  );
}

// ── Badge de estado ───────────────────────────────────────────
export function BadgeEstado({ estado }) {
  const info = estadoInfo(estado);
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 10px', borderRadius:20,
      background: info.bg, color: info.color,
      fontSize:12, fontWeight:600, whiteSpace:'nowrap',
      border:`1px solid ${info.color}44`,
    }}>
      {info.icon} {info.label}
    </span>
  );
}

// ── Badge genérico ────────────────────────────────────────────
export function Badge({ children, color='var(--text-3)', bg='var(--bg-3)' }) {
  return (
    <span style={{
      display:'inline-block', padding:'2px 10px', borderRadius:20,
      background:bg, color, fontSize:11.5, fontWeight:600,
    }}>{children}</span>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({ children, style={}, className='' }) {
  return (
    <div className={className} style={{
      background:'var(--bg-2)', border:'1px solid var(--border)',
      borderRadius:'var(--radius)', padding:20, ...style,
    }}>
      {children}
    </div>
  );
}

// ── Input Field ───────────────────────────────────────────────
export function InputField({ label, icon, type='text', value, onChange,
                              placeholder, error, name, required, disabled,
                              endIcon, onEndClick }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && (
        <label style={{ fontSize:11.5, fontWeight:600, color:'var(--text-2)',
                        letterSpacing:'0.05em', textTransform:'uppercase' }}>
          {label}{required && <span style={{color:'var(--red)'}}> *</span>}
        </label>
      )}
      <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
        {icon && (
          <span style={{ position:'absolute', left:12, color:'var(--text-3)',
                         display:'flex', alignItems:'center', pointerEvents:'none',
                         transition:'var(--trans)' }}>
            {icon}
          </span>
        )}
        <input
          name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} required={required} disabled={disabled}
          style={{
            width:'100%',
            background: disabled ? 'var(--bg-3)' : 'var(--bg-3)',
            border:`1.5px solid ${error ? 'rgba(232,50,26,0.7)' : 'var(--border)'}`,
            borderRadius:'var(--radius-sm)',
            padding: `11px ${endIcon?'40px':'14px'} 11px ${icon?'40px':'14px'}`,
            fontFamily:'var(--font-body)', fontSize:14, color:'var(--text-1)',
            outline:'none', transition:'var(--trans)',
            opacity: disabled ? 0.6 : 1,
          }}
          onFocus={e  => { e.target.style.borderColor='var(--border-act)'; e.target.style.boxShadow='0 0 0 3px var(--red-glow)'; }}
          onBlur={e   => { e.target.style.borderColor=error?'rgba(232,50,26,0.7)':'var(--border)'; e.target.style.boxShadow='none'; }}
        />
        {endIcon && (
          <span onClick={onEndClick}
            style={{ position:'absolute', right:12, color:'var(--text-3)',
                     cursor:'pointer', display:'flex', alignItems:'center' }}>
            {endIcon}
          </span>
        )}
      </div>
      {error && <span style={{ fontSize:11.5, color:'var(--red-light)' }}>⚠ {error}</span>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
export function SelectField({ label, value, onChange, options=[], error, name, required, placeholder }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && (
        <label style={{ fontSize:11.5, fontWeight:600, color:'var(--text-2)',
                        letterSpacing:'0.05em', textTransform:'uppercase' }}>
          {label}{required && <span style={{color:'var(--red)'}}> *</span>}
        </label>
      )}
      <select name={name} value={value} onChange={onChange}
        style={{
          width:'100%', background:'var(--bg-3)',
          border:`1.5px solid ${error?'rgba(232,50,26,0.7)':'var(--border)'}`,
          borderRadius:'var(--radius-sm)', padding:'11px 14px',
          fontFamily:'var(--font-body)', fontSize:14, color: value ? 'var(--text-1)' : 'var(--text-3)',
          outline:'none', cursor:'pointer', appearance:'none',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background:'var(--bg-3)' }}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize:11.5, color:'var(--red-light)' }}>⚠ {error}</span>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────
export function TextareaField({ label, value, onChange, placeholder, error, name, rows=3, required }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && (
        <label style={{ fontSize:11.5, fontWeight:600, color:'var(--text-2)',
                        letterSpacing:'0.05em', textTransform:'uppercase' }}>
          {label}{required && <span style={{color:'var(--red)'}}> *</span>}
        </label>
      )}
      <textarea name={name} value={value} onChange={onChange}
        placeholder={placeholder} rows={rows} required={required}
        style={{
          width:'100%', background:'var(--bg-3)',
          border:`1.5px solid ${error?'rgba(232,50,26,0.7)':'var(--border)'}`,
          borderRadius:'var(--radius-sm)', padding:'11px 14px',
          fontFamily:'var(--font-body)', fontSize:14, color:'var(--text-1)',
          outline:'none', resize:'vertical',
        }}
        onFocus={e => { e.target.style.borderColor='var(--border-act)'; e.target.style.boxShadow='0 0 0 3px var(--red-glow)'; }}
        onBlur={e  => { e.target.style.borderColor=error?'rgba(232,50,26,0.7)':'var(--border)'; e.target.style.boxShadow='none'; }}
      />
      {error && <span style={{ fontSize:11.5, color:'var(--red-light)' }}>⚠ {error}</span>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width=480 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000, padding:16, backdropFilter:'blur(4px)',
    }}>
      <div onClick={e=>e.stopPropagation()} className="fade-up" style={{
        background:'var(--bg-2)', border:'1px solid var(--border)',
        borderRadius:'var(--radius)', width:'100%', maxWidth:width,
        maxHeight:'90vh', overflow:'auto',
      }}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 20px', borderBottom:'1px solid var(--border)',
        }}>
          <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:16 }}>{title}</h3>
          <button onClick={onClose} style={{
            background:'none', border:'none', color:'var(--text-3)',
            cursor:'pointer', fontSize:20, lineHeight:1,
          }}>✕</button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon='📭', title, description, action }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'48px 24px', textAlign:'center', gap:12,
    }}>
      <div style={{ fontSize:48 }}>{icon}</div>
      <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:17, color:'var(--text-1)' }}>{title}</h3>
      {description && <p style={{ fontSize:13.5, color:'var(--text-2)', maxWidth:300 }}>{description}</p>}
      {action}
    </div>
  );
}

// ── Spinner de página ─────────────────────────────────────────
export function PageSpinner() {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100%', minHeight:240,
    }}>
      <div style={{
        width:36, height:36, borderRadius:'50%',
        border:'3px solid var(--bg-4)',
        borderTopColor:'var(--red)',
        animation:'spin .7s linear infinite',
      }} />
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────
export function KpiCard({ icon, label, value, sub, color='var(--red)' }) {
  return (
    <Card style={{ display:'flex', gap:16, alignItems:'center' }}>
      <div style={{
        width:48, height:48, borderRadius:12, flexShrink:0,
        background:`${color}18`, border:`1px solid ${color}33`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:26, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:12.5, color:'var(--text-2)', marginTop:3 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{sub}</div>}
      </div>
    </Card>
  );
}

// ── Avatar ────────────────────────────────────────────────────
export function Avatar({ nombre='', apellido='', foto, size=36 }) {
  const { iniciales: ini } = require('../../utils/helpers');
  if (foto) return <img src={foto} alt="avatar" style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover' }} />;
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:'var(--red-subtle)', border:'1px solid var(--red-glow)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--font-head)', fontWeight:700,
      fontSize: size * 0.35, color:'var(--red-light)',
      flexShrink:0,
    }}>
      {`${nombre[0]??''}${apellido[0]??''}`.toUpperCase()}
    </div>
  );
}
