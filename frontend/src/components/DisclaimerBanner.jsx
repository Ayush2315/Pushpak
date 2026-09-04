import React from 'react';
import { Info } from 'lucide-react';

export default function DisclaimerBanner({ customText }) {
  return (
    <div className="disclaimer-banner">
      <Info size={16} className="disclaimer-icon" />
      <div className="disclaimer-text">
        <strong>Statutory & Methodological Non-Regulatory Notice: </strong>
        {customText || 
          "PUSHPAK Prototype Analytical Index. Simulation-based analytical output. Does not represent live real-time airfare market quotations. Not an official Government of India CPI series."
        }
      </div>
    </div>
  );
}
