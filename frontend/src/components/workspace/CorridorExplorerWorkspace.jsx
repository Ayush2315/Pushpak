import React from 'react';
import { 
  Plane, 
  MapPin, 
  Clock, 
  Users, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Info,
  Building2,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useWorkspace } from '../../hooks/useWorkspace';

export default function CorridorExplorerWorkspace({ data }) {
  const { lang } = useLanguage();
  const { openContextualWindow } = useWorkspace();
  const isHi = lang === 'hi';

  if (!data) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        {isHi ? 'गलियारा डेटा अनुपलब्ध है।' : 'No corridor data provided.'}
      </div>
    );
  }

  const {
    rank,
    route_code,
    source_city,
    destination_city,
    origin_airport,
    destination_airport,
    distance_km,
    typical_duration_str,
    observed_carriers = [],
    annual_passenger_volume_est,
    daily_scheduled_flights_est,
    is_in_representative_basket,
    basket_status,
    basket_weight_pct,
    network_importance,
    pricing_characteristics
  } = data;

  return (
    <div style={{ padding: '0.75rem 1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Hero Header */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderLeft: is_in_representative_basket ? '4px solid var(--gov-teal)' : '4px solid var(--gov-amber)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontWeight: '700',
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              #{rank} {isHi ? 'राष्ट्रीय ट्रंक गलियारा' : 'National Trunk Corridor'}
            </span>
            {is_in_representative_basket ? (
              <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} />
                <span>{isHi ? 'पुष्पक मूल्य सूचकांक बास्केट में सम्मिलित' : 'Included in Representative Basket'}</span>
              </span>
            ) : (
              <span className="badge badge-demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>{isHi ? 'केवल राष्ट्रीय एक्सप्लोरर' : 'National Explorer Only'}</span>
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0' }}>
            {source_city} ({route_code.split('-')[0]}) → {destination_city} ({route_code.split('-')[1]})
          </h2>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {origin_airport} • {destination_airport}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
            {isHi ? 'अनुमानित वार्षिक यात्री' : 'Est. Annual Traffic'}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--gov-amber)', margin: '2px 0' }}>
            {annual_passenger_volume_est}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {daily_scheduled_flights_est}
          </div>
        </div>
      </div>

      {/* Corridor Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <MapPin size={14} color="var(--gov-amber)" />
            <span>{isHi ? 'उड़ान दूरी' : 'Flight Distance'}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {distance_km?.toLocaleString('en-IN')} km
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isHi ? 'सीधी महानगरीय हवाई दूरी' : 'Great-circle aerial distance'}
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <Clock size={14} color="var(--gov-teal)" />
            <span>{isHi ? 'विशिष्ट उड़ान अवधि' : 'Typical Duration'}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {typical_duration_str}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isHi ? 'नॉन-स्टॉप प्रत्यक्ष उड़ान समय' : 'Scheduled non-stop gate-to-gate'}
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <Layers size={14} color="var(--gov-saffron)" />
            <span>{isHi ? 'सूचकांक बास्केट भार' : 'Index Basket Weight'}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: is_in_representative_basket ? 'var(--gov-teal)' : 'var(--text-muted)', marginTop: '4px' }}>
            {is_in_representative_basket ? `${basket_weight_pct?.toFixed(2)}%` : '0.00%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {is_in_representative_basket ? (isHi ? 'लासपेयर्स टोकरी में सक्रिय' : 'Active in Laspeyres index') : (isHi ? 'केवल एक्सप्लोरर में सूचीबद्ध' : 'Explorer monitoring only')}
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <Building2 size={14} color="var(--text-secondary)" />
            <span>{isHi ? 'सक्रिय एयरलाइंस' : 'Active Carriers'}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {observed_carriers.length} {isHi ? 'विमानन कंपनियां' : 'Carriers'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isHi ? 'ट्रंक मार्ग पर अनुसूचित ऑपरेटर' : 'Scheduled domestic operators'}
          </div>
        </div>
      </div>

      {/* Network Significance & Pricing Behavior */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {isHi ? 'नागर विमानन नेटवर्क में महत्व' : 'National Network Role & Connectivity'}
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {network_importance}
          </p>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
              {isHi ? 'प्रेक्षित वाहक उपस्थिति:' : 'Operating Carrier Presence:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {observed_carriers.map((c, i) => (
                <span key={i} style={{
                  background: 'var(--bg-subtle)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-secondary)'
                }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {isHi ? 'किराया एवं मूल्य गतिशीलता' : 'Pricing & Fare Behavior'}
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {pricing_characteristics}
          </p>

          <div style={{
            marginTop: '12px',
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: is_in_representative_basket ? 'var(--gov-teal-light)' : 'var(--bg-subtle)',
            border: is_in_representative_basket ? '1px solid var(--gov-teal-border)' : '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: is_in_representative_basket ? 'var(--gov-teal)' : 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            <strong>{isHi ? 'बास्केट वर्गीकरण:' : 'Basket Status:'} </strong>
            {is_in_representative_basket ? (
              isHi 
                ? 'यह गलियारा प्रतिनिधि सूचकांक बास्केट में शामिल है और वर्तमान हेडलाइन/कोर मूल्य सूचकांक गणना को सीधे प्रभावित करता है।'
                : 'This corridor is active in the representative basket and directly drives the composite PUSHPAK Headline and Core Price Indices.'
            ) : (
              isHi
                ? 'यह गलियारा व्यापक राष्ट्रीय एक्सप्लोरर में निगरानी हेतु शामिल है। यह वर्तमान 3-गलियारा मूल्य सूचकांक बास्केट में सम्मिलित नहीं है।'
                : 'This corridor is monitored for broader national connectivity. It does not alter the current 3-corridor representative prototype index basket.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
