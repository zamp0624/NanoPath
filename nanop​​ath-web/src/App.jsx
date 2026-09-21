import { useState } from "react";
import TumorCanvas from "./TumorCanvas";
import "./App.css";
 <header className="header">
  <div className="brand">
    <div className="logo">N</div>

    <div>
      <h1>
        Nano<span>Path</span>
      </h1>

      <p>
        Computational Nanoparticle Drug Delivery Model
      </p>
    </div>
  </div>

  <div className="status">
    <span></span>
    Research Simulation
  </div>
</header>

function App() {
  const [tumorSize, setTumorSize] =
    useState(2.5);

  const [tumorType, setTumorType] =
    useState("Breast");

  const [pH, setPH] =
    useState(6.8);

  const [density, setDensity] =
    useState(0.5);

  const [nanoparticles, setNanoparticles] =
    useState(80);

  const [showNanoparticles, setShowNanoparticles] =
    useState(true);

  const [simulationRun, setSimulationRun] =
    useState(false);

  return (
    <main className="app">

      {/* HEADER */}

      <header className="header">

        <div className="brand">
          <div className="logo">
            N
          </div>

          <div>
            <h1>NanoPath</h1>
            <p>
              Nanoparticle Delivery
              Simulation
            </p>
          </div>
        </div>

        <div className="status">
          <span></span>
          Research Simulation
        </div>

      </header>


      {/* MAIN DASHBOARD */}

      <section className="dashboard">

        {/* LEFT PANEL */}

        <aside className="panel left-panel">

          <div className="panel-title">
            <span>⚙</span>
            TUMOR PARAMETERS
          </div>

          <p className="description">
            Adjust the parameters
            used by the simulation.
          </p>


          <label>
            Tumor Type
          </label>

          <select
            value={tumorType}
            onChange={(e) =>
              setTumorType(
                e.target.value
              )
            }
          >
            <option>
              Breast
            </option>

            <option>
              Brain
            </option>

            <option>
              Colon
            </option>

            <option>
              Skin
            </option>
          </select>


          <label>
            Tumor Size
            <strong>
              {tumorSize.toFixed(1)} cm
            </strong>
          </label>

          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={tumorSize}
            onChange={(e) =>
              setTumorSize(
                Number(e.target.value)
              )
            }
          />


          <label>
            Tumor pH
            <strong>
              {pH.toFixed(1)}
            </strong>
          </label>

          <input
            type="range"
            min="6"
            max="8"
            step="0.1"
            value={pH}
            onChange={(e) =>
              setPH(
                Number(e.target.value)
              )
            }
          />


          <label>
            Tumor Density
            <strong>
              {density.toFixed(2)}
            </strong>
          </label>

          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={density}
            onChange={(e) =>
              setDensity(
                Number(e.target.value)
              )
            }
          />


          <label>
            Nanoparticles
            <strong>
              {nanoparticles}
            </strong>
          </label>

          <input
            type="range"
            min="20"
            max="200"
            step="10"
            value={nanoparticles}
            onChange={(e) =>
              setNanoparticles(
                Number(e.target.value)
              )
            }
          />


          <button
            className="run-button"
            onClick={() =>
              setSimulationRun(
                !simulationRun
              )
            }
          >
            ▶ Run Simulation
          </button>


          <label className="checkbox-row">

            <input
              type="checkbox"
              checked={
                showNanoparticles
              }
              onChange={(e) =>
                setShowNanoparticles(
                  e.target.checked
                )
              }
            />

            Show nanoparticles

          </label>

        </aside>


        {/* CENTER */}

        <section className="visualization">

          <div className="visualization-header">

            <div>
              <span className="green-dot"></span>
              3D TUMOR VISUALIZATION
            </div>

            <div className="legend">

              <span>
                <i className="tumor-dot"></i>
                Tumor
              </span>

              <span>
                <i className="nano-dot"></i>
                Nanoparticles
              </span>

            </div>

          </div>


          <div className="canvas-container">

            <TumorCanvas
              tumorSize={tumorSize}
              nanoparticleCount={
                nanoparticles
              }
              showNanoparticles={
                showNanoparticles
              }
            />

          </div>

          <p className="interaction-help">
            Drag to rotate • Scroll to zoom
          </p>

        </section>


        {/* RIGHT PANEL */}

        <aside className="panel right-panel">

          <div className="panel-title">
            📊 TUMOR PROPERTIES
          </div>


          <div className="property-grid">

            <div>
              <span>VOLUME</span>
              <strong>
                {(tumorSize * 3.2).toFixed(1)}
                cm³
              </strong>
            </div>

            <div>
              <span>RADIUS</span>
              <strong>
                {(tumorSize / 2).toFixed(2)}
                cm
              </strong>
            </div>

          </div>


          <div className="metric">

            <div>
              <span>pH</span>
              <strong>
                {pH.toFixed(1)}
              </strong>
            </div>

            <div className="bar">
              <div
                style={{
                  width: `${((pH - 6) / 2) * 100}%`,
                }}
              />
            </div>

          </div>


          <div className="metric">

            <div>
              <span>DENSITY</span>
              <strong>
                {density.toFixed(2)}
              </strong>
            </div>

            <div className="bar">
              <div
                style={{
                  width: `${density * 100}%`,
                }}
              />
            </div>

          </div>


          <div className="results">

            <div className="panel-title">
              🧪 SIMULATION RESULTS
            </div>

            {!simulationRun ? (
              <p className="muted">
                Run the simulation to
                generate results.
              </p>
            ) : (
              <>
                <div className="result-card">
                  <span>
                    Estimated penetration
                  </span>

                  <strong>
                    72%
                  </strong>
                </div>

                <div className="result-card">
                  <span>
                    Nanoparticle accumulation
                  </span>

                  <strong>
                    68%
                  </strong>
                </div>

                <div className="recommendation">

                  <span>
                    SIMULATION INSIGHT
                  </span>

                  <p>
                    The selected parameters
                    produce a relatively
                    high predicted
                    nanoparticle penetration
                    in this educational
                    simulation.
                  </p>

                </div>
              </>
            )}

          </div>


          <div className="disclaimer">
            Educational simulation only.
            Results are not medical
            treatment recommendations.
          </div>

        </aside>

      </section>

    </main>
  );
}

export default App;