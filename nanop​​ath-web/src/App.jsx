import { useMemo, useState } from "react";
import "./App.css";

const LOCATION_DATA = {
  Brain: {
    ph: 6.8,
    permeability: 0.25,
    pressure: 1.2,
    tissueDensity: 0.65,
    bbb: 0.9,
    note: "Includes a modeled blood-brain barrier parameter.",
  },
  Breast: {
    ph: 6.8,
    permeability: 0.7,
    pressure: 1.5,
    tissueDensity: 0.5,
    note: "Illustrative breast-tumor environment parameters.",
  },
  Lung: {
    ph: 6.7,
    permeability: 0.65,
    pressure: 1.4,
    tissueDensity: 0.55,
    note: "Illustrative lung-tumor environment parameters.",
  },
  Liver: {
    ph: 6.9,
    permeability: 0.85,
    pressure: 1.2,
    tissueDensity: 0.6,
    note: "Illustrative liver-tumor environment parameters.",
  },
  Pancreas: {
    ph: 6.6,
    permeability: 0.45,
    pressure: 2.0,
    tissueDensity: 0.8,
    note: "Illustrative pancreatic-tumor environment parameters.",
  },
  Prostate: {
    ph: 6.8,
    permeability: 0.6,
    pressure: 1.3,
    tissueDensity: 0.6,
    note: "Illustrative prostate-tumor environment parameters.",
  },
  Colon: {
    ph: 6.7,
    permeability: 0.65,
    pressure: 1.6,
    tissueDensity: 0.65,
    note: "Illustrative colon-tumor environment parameters.",
  },
  "Skin (Melanoma)": {
    ph: 6.6,
    permeability: 0.6,
    pressure: 1.1,
    tissueDensity: 0.55,
    note: "Illustrative melanoma environment parameters.",
  },
};

const LOCATIONS = Object.keys(LOCATION_DATA);

function MetricCard({ label, value, detail }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      {detail && <span className="metric-detail">{detail}</span>}
    </div>
  );
}

function PropertyBar({ label, value, color = "cyan" }) {
  return (
    <div className="property-row">
      <div className="property-heading">
        <span>{label}</span>
        <strong>{value.toFixed(2)}</strong>
      </div>
      <div className="bar-track">
        <div
          className={`bar-fill ${color}`}
          style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [location, setLocation] = useState("Breast");
  const [diameter, setDiameter] = useState(2.5);
  const [density, setDensity] = useState(0.5);
  const [particleSize, setParticleSize] = useState(80);
  const [concentration, setConcentration] = useState(100);
  const [simulationTime, setSimulationTime] = useState(24);
  const [results, setResults] = useState(null);

  const properties = LOCATION_DATA[location];
  const radius = diameter / 2;
  const volume = (4 / 3) * Math.PI * radius ** 3;
  const referenceAmountUg = concentration * volume;

  // Simplified Stokes-Einstein-inspired estimate.
  // This is an illustrative model, not a validated medical prediction.
  const diffusionCoefficient = useMemo(() => {
    const temperature = 310;
    const boltzmann = 1.380649e-23;
    const viscosity = 0.001;
    const particleRadiusMeters = (particleSize / 2) * 1e-9;

    return (
      (boltzmann * temperature) /
      (6 * Math.PI * viscosity * particleRadiusMeters)
    );
  }, [particleSize]);

  function runSimulation() {
    const validInputs =
    Number.isFinite(diameter) &&
    diameter >= 0.5 &&
    diameter <= 8 &&
    Number.isFinite(density) &&
    density >= 0.1 &&
    density <= 1 &&
    Number.isFinite(particleSize) &&
    particleSize >= 10 &&
    particleSize <= 200 &&
    Number.isFinite(concentration) &&
    concentration >= 1 &&
    concentration <= 400 &&
    Number.isFinite(simulationTime) &&
    simulationTime >= 1 &&
    simulationTime <= 72;

  if (!validInputs) {
    setResults(null);
    window.alert("Please use valid values for all simulation parameters.");
    return;
  }
    // Illustrative relative diffusion adjustment based on the  
    // user-controlled density and location parameters.
    const densityFactor = Math.max(0.05, 1 - density * 0.75);
    const locationFactor =
      properties.permeability *
      (location === "Brain" ? 1 - properties.bbb * 0.7 : 1);

    const effectiveD =
      diffusionCoefficient * densityFactor * locationFactor;

    // Characteristic diffusion length: sqrt(2 * D * t).
    const timeSeconds = simulationTime * 3600;
    const diffusionLengthMeters = Math.sqrt(
      2 * effectiveD * timeSeconds
    );

    const characteristicDiffusionLenghtMm =
      diffusionLengthMeters * 1000;

    const penetrationMm = Math.min(
      radius *10,
      characteristicDiffusionLenghtMm
    );

    const radiusMm = radius * 10;
    const efficiency =
      radiusMm > 0
        ? Math.min(100, (penetrationMm / radiusMm) * 100)
        : 0;

    setResults({
      effectiveD,
      characteristicDiffusionLenghtMm,
      penetrationMm,
      efficiency,
      concentration,
      time: simulationTime,
    });
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <div className="brand-line">
            <span className="brand-mark">N</span>
            <h1>NanoPath</h1>
          </div>
          <p>Nanoparticle Delivery Simulation</p>
        </div>
        <span className="status-pill">
          <span className="status-dot" />
          Research Simulation
        </span>
      </header>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Tumor Parameters</h2>
              <p>Set the conditions for your computational experiment.</p>
            </div>
          </div>

          <label className="field-label">Anatomical Location</label>
          <div className="location-grid">
            {LOCATIONS.map((item) => (
              <button
                key={item}
                type="button"
                className={`location-button ${location === item ? "selected" : ""}`}
                onClick={() => {
                  setLocation(item);
                  setResults(null);
                }}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="slider-field">
            <div className="slider-heading">
              <label htmlFor="diameter">Tumor Diameter</label>
              <strong>{diameter.toFixed(1)} cm</strong>
            </div>
            <input
              id="diameter"
              type="range"
              min="0.5"
              max="8"
              step="0.1"
              value={diameter}
              onChange={(e) => {
                setDiameter(Number(e.target.value));
                setResults(null);
              }}
            />
            <div className="range-labels">
              <span>0.5 cm</span>
              <span>8.0 cm</span>
            </div>
          </div>

          <div className="slider-field">
            <div className="slider-heading">
              <label htmlFor="density">Simulated Tumor Density</label>
              <strong>{density.toFixed(2)}</strong>
            </div>
            <input
              id="density"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={density}
              onChange={(e) => {
                setDensity(Number(e.target.value));
                setResults(null);
              }}
            />
            <div className="range-labels">
              <span>0.10</span>
              <span>1.00</span>
            </div>
            <p className="helper-text">User-controlled experimental variable</p>
          </div>

          <div className="slider-field">
            <div className="slider-heading">
              <label htmlFor="particle">Nanoparticle Diameter</label>
              <strong>{particleSize} nm</strong>
            </div>
            <input
              id="particle"
              type="range"
              min="10"
              max="200"
              step="1"
              value={particleSize}
              onChange={(e) => {
                setParticleSize(Number(e.target.value));
                setResults(null);
              }}
            />
          </div>

          <div className="slider-field">
            <div className="slider-heading">
              <label htmlFor="concentration">Initial Concentration</label>
              <strong>{concentration} μg/mL</strong>
            </div>
            <input
              id="concentration"
              type="range"
              min="1"
              max="400"
              step="1"
              value={concentration}
              onChange={(e) => {
                setConcentration(Number(e.target.value));
                setResults(null);
              }}
            />
          </div>

          <div className="slider-field">
            <div className="slider-heading">
              <label htmlFor="time">Simulation Time</label>
              <strong>{simulationTime} h</strong>
            </div>
            <input
              id="time"
              type="range"
              min="1"
              max="72"
              step="1"
              value={simulationTime}
              onChange={(e) => {
                setSimulationTime(Number(e.target.value));
                setResults(null);
              }}
            />
          </div>

          <button className="run-button" onClick={runSimulation}>
            Run Penetration Simulation <span>↗</span>
          </button>
        </section>

        <div className="right-column">
          <section className="panel">
            <div className="panel-heading">
              <h2>Tumor Properties</h2>
              <span className="location-badge">{location}</span>
            </div>

            <div className="metric-grid">
              <MetricCard
                label="Volume"
                value={`${volume.toFixed(2)} cm³`}
              />
              <MetricCard
                label="Radius"
                value={`${radius.toFixed(2)} cm`}
              />
            </div>

            {location === "Brain" && (
              <PropertyBar
                label="Blood-Brain Barrier"
                value={properties.bbb}
                color="purple"
              />
            )}

            <PropertyBar
              label="Vascular Permeability"
              value={properties.permeability}
              color="orange"
            />
            <PropertyBar
              label="Modeled Tissue Density"
              value={properties.tissueDensity}
              color="yellow"
            />

            <div className="property-stat-grid">
              <MetricCard
                label="Interstitial Pressure"
                value={`${properties.pressure.toFixed(2)} kPa`}
                detail="Location-based model parameter"
              />
              <MetricCard
                label="Tumor pH"
                value={properties.ph.toFixed(2)}
                detail="Location-based model parameter"
              />
            </div>

            <p className="model-note">
              {properties.note} These values are illustrative model
              assumptions, not universal clinical measurements.
            </p>
          </section>

          <section className="panel output-panel">
            <div className="panel-heading">
              <div>
                <h2>Simulation Output</h2>
                <p>Computed estimates for the selected model settings.</p>
              </div>
            </div>

            <div className="metric-grid">
              <MetricCard
                label="Nanoparticle Size"
                value={`${particleSize} nm`}
              />
              <MetricCard
                label="Reference Amount"
                value={`${referenceAmountUg.toFixed(2)} μg`}
                detail="Illustrative amount assuming uniform concentration throughout the modeled tumor volume; not actual tumor uptake."
              />
              <MetricCard
                label="Initial Concentration"
                value={`${concentration} μg/mL`}
              />
              <MetricCard
                label="Modeled Effective Diffusion Coefficient"
                value={
                  results
                    ? `${results.effectiveD.toExponential(2)} m²/s`
                    : `${diffusionCoefficient.toExponential(2)} m²/s`
                }
                detail={
                  results
                    ? "Strokes-Einstein estimate adjusted by illustrative model factors."
                    : "Unadjusted Stokes-Einstein estimate for an idealized fluid."
                }
              />
              <MetricCard
                label="Characteristic Diffusion Length"
                value={
                  results
                    ? `${results.characteristicDiffusionLenghtMm.toFixed(3)} mm`
                    : "-"
                }
                detail="Uncapped estimate from the simplified diffusion equation."
              />
              <MetricCard
                label="Relative Penetration Estimate"
                value={results ? `${results.efficiency.toFixed(1)}%` : "—"}
              />
            </div>

            <div className="penetration-section">
              <div className="slider-heading">
                <span>Predicted Penetration Depth</span>
                <strong>
                  {results ? `${results.penetrationMm.toFixed(3)} mm` : "Run simulation"}
                </strong>
              </div>
              <div className="bar-track large">
                <div
                  className="bar-fill cyan"
                  style={{
                    width: `${results ? results.efficiency : 0}%`,
                  }}
                />
              </div>
              <p className="helper-text">
                Model-specific estimate relative to the tumor radius; not a validated prediction of actual tumor delivery or absorption.
              </p>
            </div>

            {results && (
              <div className="interpretation">
                <h3>Model Interpretation</h3>
                <p>
                  Under these assumptions, the model estimates a
                  characteristic diffusion length over {results.time} hours.
                  Compare results across density settings to investigate how
                  your selected experimental variable affects modeled
                  penetration.
                </p>
              </div>
            )}

            {!results && (
              <div className="empty-state">
                Adjust the parameters, then run the simulation to view its
                results here.
              </div>
            )}
          </section>
        </div>
      </div>
<section className="privacy-card" aria-labelledby="privacy-title">
  <div className="privacy-heading">
    <span className="privacy-icon" aria-hidden="true">🛡️</span>
    <div>
      <h2 id="privacy-title">Privacy &amp; Security</h2>
      <p>Your privacy matters.</p>
    </div>
  </div>

  <div className="privacy-grid">
    <div className="privacy-item">
      <h3>No Personal Information</h3>
      <p>
        NanoPath does not require an account, name, email address,
        or other personal information to use its simulation tools.
      </p>
    </div>

    <div className="privacy-item">
      <h3>Browser-Based Simulations</h3>
      <p>
        Simulation calculations are designed to run in your browser
        without sending your simulation inputs to a separate server.
      </p>
    </div>

    <div className="privacy-item">
      <h3>No Tracking by Design</h3>
      <p>
        NanoPath is designed without advertising trackers or analytics
        that profile users.
      </p>
    </div>
  </div>

  <p className="privacy-note">
    Privacy and security depend on the deployed version and its hosting
    configuration.
  </p>
</section>

<div className="copyright-notice">
  <p>Copyright © 2026 Zara Alejandra Monsalve Pérez</p>
  <p>All rights reserved.</p>
  <p className="copyright-description">
    NanoPath is a computational research project.
    The source code may not be copied, modified, distributed,
    or reused without permission from the copyright holder.
  </p>
</div>  
      <footer className="app-footer">
        Educational computational model only. Parameters and outputs are
        illustrative and are not medical treatment recommendations.
      </footer>
    </main>
  );
}