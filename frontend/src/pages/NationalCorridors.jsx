import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Filter, 
  ShieldCheck, 
  Layers, 
  Plane, 
  ArrowRight, 
  Info, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useWorkspace } from '../hooks/useWorkspace';
import api from '../api/client';

export default function NationalCorridors() {
  const { lang, t } = useLanguage();
  const { openContextualWindow, activeWindow } = useWorkspace();
  const isHi = lang === 'hi';

  const [corridors, setCorridors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'BASKET' | 'EXPLORER'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchCorridors = async () => {
      try {
        setLoading(true);
        const data = await api.getTop10Corridors();
        if (isMounted) {
          setCorridors(data?.corridors || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load national corridors');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCorridors();
    return () => { isMounted = false; };
  }, []);

  const handleRowClick = (corridor) => {
    openContextualWindow({
      id: `corridor-${corridor.route_code}`,
      title: `${corridor.source_city} — ${corridor.destination_city} (${corridor.route_code})`,
      type: 'corridor-explorer',
      data: corridor
    });
  };

  const filteredCorridors = corridors.filter(c => {
    if (filterType === 'BASKET' && !c.is_in_representative_basket) return false;
    if (filterType === 'EXPLORER' && c.is_in_representative_basket) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoute = c.route_code.toLowerCase().includes(q);
      const matchCity = c.source_city.toLowerCase().includes(q) || c.destination_city.toLowerCase().includes(q);
      const matchCarrier = (c.observed_carriers || []).some(carrier => carrier.toLowerCase().includes(q));
      return matchRoute || matchCity || matchCarrier;
    }
    return true;
  });

  const basketCount = corridors.filter(c => c.is_in_representative_basket).length;
  const explorerOnlyCount = corridors.filter(c => !c.is_in_representative_basket).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '1.5rem 1.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: 'var(--gov-amber-light)',
                color: 'var(--gov-amber)',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {isHi ? 'राष्ट्रीय वायु गलियारा एक्सप्लोरर' : 'National Aviation Corridor Explorer'}
              </span>
              <span className="badge badge-demo">
                {isHi ? 'ट्रंक रूट विश्लेषिकी' : 'Trunk Route Analytics'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px' }}>
              {isHi ? 'शीर्ष 10 राष्ट्रीय वायु गलियारा एक्सप्लोरर' : 'Top 10 National Aviation Corridors'}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '820px', lineHeight: '1.6' }}>
              {isHi
                ? 'राष्ट्रीय गलियारा एक्सप्लोरर व्यापक भारतीय घरेलू मार्गों की कनेक्टिविटी एवं मूल्य व्यवहार का अवलोकन प्रदान करता है। यह पुष्पक मूल्य सूचकांक में प्रयुक्त 3-मार्गीय प्रतिनिधि बास्केट से भिन्न एवं पृथक है।'
                : 'The National Corridor Explorer provides broader domestic route exploration and capacity tracking. It is strictly separate from the 3-route representative basket used for the PUSHPAK Price Index.'
              }
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'var(--gov-teal-light)',
              border: '1px solid var(--gov-teal-border)',
              borderRadius: '8px',
              padding: '10px 14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--gov-teal)', fontWeight: '700', textTransform: 'uppercase' }}>
                {isHi ? 'सूचकांक बास्केट' : 'Index Basket'}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--gov-teal)' }}>
                {basketCount} {isHi ? 'मार्ग' : 'Routes'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gov-teal)' }}>
                {isHi ? '100% लासपेयर्स भार' : '100% Laspeyres'}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px 14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                {isHi ? 'एक्सप्लोरर मात्र' : 'Explorer Only'}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {explorerOnlyCount} {isHi ? 'मार्ग' : 'Routes'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {isHi ? 'व्यापक निगरानी' : 'Wider Monitoring'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distinction Card: Basket vs Explorer */}
      <div style={{
        background: '#fffbf7',
        border: '1px solid #fed7aa',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Info size={20} color="var(--gov-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.84rem', color: '#9a3412', lineHeight: '1.55' }}>
          <strong>{isHi ? 'पद्धति एवं बास्केट पृथक्करण सिद्धांत:' : 'Methodology & Basket Separation Principle:'} </strong>
          {isHi
            ? 'पुष्पक हेडलाइन और कोर मूल्य सूचकांक केवल 3 प्रतिनिधि ट्रंक गलियारों (DEL-BOM, DEL-BLR, BOM-BLR) के निश्चित भारित लासपेयर्स योग पर आधारित हैं। नीचे सूचीबद्ध 7 अन्य राष्ट्रीय गलियारे व्यापक मांग और उपज प्रवृत्तियों की निगरानी के लिए हैं और सूचकांक संख्या को परिवर्तित नहीं करते हैं।'
            : 'The PUSHPAK Headline and Core Price Indices are strictly derived from the 3 representative trunk routes (DEL-BOM, DEL-BLR, BOM-BLR) using historical passenger volume weighting. The additional 7 corridors displayed below demonstrate national corridor coverage without altering the official index calculation.'
          }
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: '#ffffff',
        padding: '0.85rem 1.25rem',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginRight: '4px' }}>
            <Filter size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            {isHi ? 'फ़िल्टर:' : 'Filter:'}
          </span>
          <button
            onClick={() => setFilterType('ALL')}
            className="btn btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: filterType === 'ALL' ? '700' : '500',
              background: filterType === 'ALL' ? 'var(--gov-amber)' : '#ffffff',
              color: filterType === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: filterType === 'ALL' ? 'var(--gov-amber)' : 'var(--border-subtle)'
            }}
          >
            {isHi ? 'सभी शीर्ष 10' : 'All Top 10'} ({corridors.length})
          </button>
          <button
            onClick={() => setFilterType('BASKET')}
            className="btn btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: filterType === 'BASKET' ? '700' : '500',
              background: filterType === 'BASKET' ? 'var(--gov-teal)' : '#ffffff',
              color: filterType === 'BASKET' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: filterType === 'BASKET' ? 'var(--gov-teal)' : 'var(--border-subtle)'
            }}
          >
            🟢 {isHi ? 'सूचकांक बास्केट' : 'Representative Basket'} ({basketCount})
          </button>
          <button
            onClick={() => setFilterType('EXPLORER')}
            className="btn btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: filterType === 'EXPLORER' ? '700' : '500',
              background: filterType === 'EXPLORER' ? 'var(--text-secondary)' : '#ffffff',
              color: filterType === 'EXPLORER' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: filterType === 'EXPLORER' ? 'var(--text-secondary)' : 'var(--border-subtle)'
            }}
          >
            ⚪ {isHi ? 'एक्सप्लोरर मात्र' : 'Explorer Only'} ({explorerOnlyCount})
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={isHi ? 'मार्ग कोड या शहर खोजें...' : 'Search route, city, carrier...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 32px',
              fontSize: '0.82rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              outline: 'none',
              background: 'var(--bg-subtle)'
            }}
          />
        </div>
      </div>

      {/* Corridors Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="status-dot" style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--gov-amber)', marginRight: '8px' }} />
            {isHi ? 'राष्ट्रीय गलियारा डेटा लोड हो रहा है...' : 'Loading national corridor network...'}
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gov-red)' }}>
            <AlertCircle size={24} style={{ display: 'block', margin: '0 auto 8px' }} />
            {error}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 16px', width: '60px' }}>{isHi ? 'रैंक' : 'Rank'}</th>
                  <th style={{ padding: '12px 16px' }}>{isHi ? 'मार्ग कोड' : 'Route Code'}</th>
                  <th style={{ padding: '12px 16px' }}>{isHi ? 'शहर युग्म / हवाई अड्डे' : 'City Pair & Airports'}</th>
                  <th style={{ padding: '12px 16px' }}>{isHi ? 'दूरी' : 'Distance'}</th>
                  <th style={{ padding: '12px 16px' }}>{isHi ? 'अवधि' : 'Typical Duration'}</th>
                  <th style={{ padding: '12px 16px' }}>{isHi ? 'सक्रिय एयरलाइंस' : 'Observed Carriers'}</th>
                  <th style={{ padding: '12px 16px' }}>{isHi ? 'बास्केट स्थिति' : 'Basket Status'}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>{isHi ? 'कार्रवाई' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCorridors.map((c) => {
                  const isSelected = activeWindow?.id === `corridor-${c.route_code}`;
                  return (
                    <tr
                      key={c.route_code}
                      onClick={() => handleRowClick(c)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        background: isSelected ? 'var(--gov-amber-light)' : '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#faf8f5';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      {/* Rank */}
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: c.is_in_representative_basket ? 'var(--gov-teal-light)' : 'var(--bg-subtle)',
                          color: c.is_in_representative_basket ? 'var(--gov-teal)' : 'var(--text-primary)',
                          fontWeight: '800',
                          fontSize: '0.8rem'
                        }}>
                          {c.rank}
                        </span>
                      </td>

                      {/* Route Code */}
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Plane size={14} color="var(--gov-amber)" />
                          <span>{c.route_code}</span>
                        </div>
                      </td>

                      {/* City Pair */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {c.source_city} ↔ {c.destination_city}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.origin_airport} • {c.destination_airport}
                        </div>
                      </td>

                      {/* Distance */}
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                        {c.distance_km?.toLocaleString('en-IN')} km
                      </td>

                      {/* Duration */}
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {c.typical_duration_str}
                      </td>

                      {/* Observed Carriers */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                          {(c.observed_carriers || []).map((carrier, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: 'var(--bg-subtle)',
                                color: 'var(--text-secondary)',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-subtle)'
                              }}
                            >
                              {carrier}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Basket Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {c.is_in_representative_basket ? (
                          <span className="badge badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={12} />
                            <span>🟢 {isHi ? 'प्रतिनिधि बास्केट' : 'Representative Basket'}</span>
                          </span>
                        ) : (
                          <span className="badge badge-demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span>⚪ {isHi ? 'एक्सप्लोरर मात्र' : 'Explorer Only'}</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(c);
                          }}
                          className="btn btn-secondary"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{isHi ? 'विवरण' : 'Inspect'}</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Context Info Footer */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={16} color="var(--gov-teal)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {isHi
              ? 'किसी भी गलियारे पर क्लिक करने से एकल प्रासंगिक सूचना विंडो में विस्तृत नेटवर्क एवं किराया व्यवहार खुलेगा।'
              : 'Clicking any corridor row opens its complete network role and fare characteristics inside the single contextual analytical window.'
            }
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {isHi ? 'स्रोत: डीजीसीए आवधिक रिपोर्ट एवं पुष्पक नेटवर्क रजिस्ट्री' : 'Source: DGCA Periodic Reports & PUSHPAK Flight Registry'}
        </div>
      </div>
    </div>
  );
}
