import math
import tkinter as tk


def get_tissue_properties(location):
    tissue_profiles = {
        "Brain": {
            "location": "Brain",
            "porosity": 0.18,
            "vascularity": 0.24,
            "interstitial_pressure": 0.35,
            "stiffness": 0.42,
            "description": "Dense brain parenchyma with low vascular permeability and high extracellular resistance"
        },
        "Liver": {
            "location": "Liver",
            "porosity": 0.30,
            "vascularity": 0.68,
            "interstitial_pressure": 0.22,
            "stiffness": 0.18,
            "description": "Highly vascular hepatic tissue with relatively open sinusoidal spaces"
        },
        "Lung": {
            "location": "Lung",
            "porosity": 0.25,
            "vascularity": 0.55,
            "interstitial_pressure": 0.28,
            "stiffness": 0.24,
            "description": "Alveolar-rich tissue with moderate permeability and compressible architecture"
        },
        "Pancreas": {
            "location": "Pancreas",
            "porosity": 0.12,
            "vascularity": 0.31,
            "interstitial_pressure": 0.44,
            "stiffness": 0.39,
            "description": "Dense stromal tissue with elevated fibrosis and limited diffusion"
        },
        "Colon": {
            "location": "Colon",
            "porosity": 0.15,
            "vascularity": 0.37,
            "interstitial_pressure": 0.33,
            "stiffness": 0.30,
            "description": "Moderately dense mucosal tissue with uneven permeability"
        }
    }

    return tissue_profiles.get(location, {
        "location": location,
        "porosity": 0.20,
        "vascularity": 0.40,
        "interstitial_pressure": 0.30,
        "stiffness": 0.30,
        "description": "Generic tissue profile used as a fallback"
    })


def calculate_penetration_depth(location, diameter, nanoparticle, concentration):
    tissue = get_tissue_properties(location)

    if diameter <= 0 or nanoparticle <= 0 or concentration <= 0:
        return None

    porosity = tissue["porosity"]
    vascularity = tissue["vascularity"]
    interstitial_pressure = tissue["interstitial_pressure"]
    stiffness = tissue["stiffness"]

    transport_score = (porosity * 0.45) + (vascularity * 0.35) + ((1 - interstitial_pressure) * 0.10) + ((1 - stiffness) * 0.10)
    effective_diffusion = max(0.05, min(0.95, transport_score))

    return (effective_diffusion * concentration * nanoparticle) / diameter


def create_interface(window):
    title = tk.Label(
        window,
        text="NanoPath Simulator",
        font=("Arial", 26, "bold")
    )
    title.pack(pady=20)
    subtitle = tk.Label(
        window,
        text="Computational Nanoparticle Drug Delivery Model",
        font=("Arial", 14)
    )
    subtitle.pack()
    # Tumor location label
    location_label = tk.Label(
        window,
        text="Tumor Location:",
        font=("Arial", 12)
    )
    location_label.pack()
    # Drop-down menu
    tumor_location = tk.StringVar()
    tumor_location.set("Brain")
    location_menu = tk.OptionMenu(
        window,
        tumor_location,
        "Brain",
        "Liver",
        "Lung",
        "Pancreas",
        "Colon"
    )
    location_menu.pack(pady=10)

    size_label = tk.Label(
        window,
        text="Tumor Diameter (mm)",
        font=("Arial", 12)
    )
    size_label.pack()

    tumor_size = tk.Entry(
        window,
        width=15,
        justify="center"
    )
    tumor_size.pack(pady=10)
    canvas = tk.Canvas(
            window,
            width=600,
            height=450,
            bg="white"
        )
    canvas.pack(pady=20)
    canvas.create_text(
            300, 40,
            text="Tumor",
            font=("Arial", 16, "bold")
        )
    def update_tumor():
        canvas.delete("all")

        try:
            diameter = float(tumor_size.get())
        except ValueError:
            diameter = 300.0

        diameter = max(40, min(400, diameter))
        location = tumor_location.get()

        if location == "Brain":
            color = "#ff7f7f"
            core_color = "#ffe5e5"
        elif location == "Liver":
            color = "#f6c542"
            core_color = "#fff2c2"
        elif location == "Lung":
            color = "#87cefa"
            core_color = "#eaf7ff"
        elif location == "Pancreas":
            color = "#d8a4e6"
            core_color = "#f7eaff"
        elif location == "Colon":
            color = "#8fe38f"
            core_color = "#eefdee"
        else:
            color = "#b0b0b0"
            core_color = "#f2f2f2"

        penetration = calculate_penetration_depth_from_ui()
        if penetration is None:
            penetration = diameter * 0.15
        penetration_fraction = min(1.0, max(0.1, penetration / max(1.0, diameter)))

        center_x = 300
        center_y = 225
        radius_x = diameter / 2
        radius_y = diameter / 2 * 0.8

        shadow_dx = 14
        shadow_dy = 10
        canvas.create_oval(
            center_x - radius_x + shadow_dx,
            center_y - radius_y + shadow_dy,
            center_x + radius_x + shadow_dx,
            center_y + radius_y + shadow_dy,
            fill="#c8c8c8",
            outline="",
            tags="tumor"
        )

        canvas.create_oval(
            center_x - radius_x,
            center_y - radius_y,
            center_x + radius_x,
            center_y + radius_y,
            fill=color,
            outline="#8b0000",
            width=3,
            tags="tumor"
        )

        canvas.create_oval(
            center_x - radius_x * 0.65,
            center_y - radius_y * 0.55,
            center_x + radius_x * 0.20,
            center_y + radius_y * 0.20,
            fill="#ffffff",
            outline="",
            stipple="gray12",
            tags="tumor"
        )

        inner_radius_x = radius_x * (1 - 0.38 * penetration_fraction)
        inner_radius_y = radius_y * (1 - 0.38 * penetration_fraction)
        canvas.create_oval(
            center_x - inner_radius_x,
            center_y - inner_radius_y,
            center_x + inner_radius_x,
            center_y + inner_radius_y,
            fill=core_color,
            outline="",
            tags="tumor"
        )

        front_radius_x = radius_x * (1 - 0.20 * penetration_fraction)
        front_radius_y = radius_y * (1 - 0.20 * penetration_fraction)
        canvas.create_oval(
            center_x - front_radius_x,
            center_y - front_radius_y,
            center_x + front_radius_x,
            center_y + front_radius_y,
            outline="#1e90ff",
            width=3,
            tags="tumor"
        )

        for i in range(12):
            angle = i * (2 * math.pi / 12)
            if i / 12 < penetration_fraction:
                particle_radius = 3.5
                particle_x = center_x + math.cos(angle) * (radius_x * 0.72)
                particle_y = center_y + math.sin(angle) * (radius_y * 0.72)
                canvas.create_oval(
                    particle_x - particle_radius,
                    particle_y - particle_radius,
                    particle_x + particle_radius,
                    particle_y + particle_radius,
                    fill="#1e90ff",
                    outline="",
                    tags="tumor"
                )

        canvas.create_text(
            center_x,
            40,
            text=f"{location} Tumor",
            font=("Arial", 16, "bold"),
            tags="tumor"
        )
        canvas.create_text(
            center_x,
            420,
            text=f"Drug penetration front: {penetration:.2f} mm",
            font=("Arial", 12, "bold"),
            tags="tumor"
        )

    tumor_size.insert(0, "300")

    nano_label = tk.Label(
        window,
        text="Nanoparticle Size (nm)",
        font=("Arial", 12)
    )
    nano_label.pack()

    nano_size = tk.Entry(
        window,
        width=15,
        justify="center"
    )
    nano_size.insert(0, "100")
    nano_size.pack(pady=10)

    drug_label = tk.Label(
        window,
        text="Drug Concentration (mg/mL)",
        font=("Arial", 12)
    )
    drug_label.pack()

    drug_concentration = tk.Entry(
        window,
        width=15,
        justify="center"
    )
    drug_concentration.insert(0, "2.5")
    drug_concentration.pack(pady=10)

    result_label = tk.Label(
        window,
        text="Simulation results will appear here.",
        font=("Arial", 12),
        justify="left"
    )
    result_label.pack(pady=10)

    def calculate_penetration_depth_from_ui():
        location = tumor_location.get()

        try:
            diameter = float(tumor_size.get())
            nanoparticle = float(nano_size.get())
            concentration = float(drug_concentration.get())
        except ValueError:
            return None

        return calculate_penetration_depth(
            location=location,
            diameter=diameter,
            nanoparticle=nanoparticle,
            concentration=concentration,
        )

    def run_simulation():
        penetration = calculate_penetration_depth_from_ui()
        if penetration is None:
            result_label.config(
                text="Please enter valid positive values for all fields."
            )
            return

        tissue = get_tissue_properties(tumor_location.get())
        result_label.config(
            text=(
                f"Estimated Penetration Depth: {penetration:.2f} mm\n"
                f"Tissue profile: {tissue['description']}"
            )
        )

    update_button = tk.Button(
        window,
        text="Update Tumor",
        command=update_tumor
    )
    update_button.pack(pady=10)

    run_button = tk.Button(
        window,
        text="Run Simulation",
        font=("Arial", 12, "bold"),
        bg="#2E8B57",
        fg="white",
        command=run_simulation
    )
    run_button.pack(pady=10)

    update_tumor()

print("ui.py loaded successfully")

if __name__ == "__main__":
    root = tk.Tk()
    root.title("NanoPath Simulator")
    create_interface(root)
    root.mainloop()