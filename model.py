import math

# Physical constants
K_B = 1.380649e-23       # Boltzmann constant (J/K)
T_BODY = 310             # Approximate body temperature (K)
TREATMENT_TIME = 24 * 3600   # 24 hours in seconds
TUMOR_LOCATIONS = {
    "brain": {
        "name": "Brain",
        "bbb": 0.85,
        "vascular_permeability": 0.30,
        "ifp": 2.5,
        "density": 0.70,
        "ph": 6.6,
        "optimal_np_size": (10, 20),
    },

    "breast": {
        "name": "Breast",
        "bbb": 0.05,
        "vascular_permeability": 0.70,
        "ifp": 1.5,
        "density": 0.50,
        "ph": 6.8,
        "optimal_np_size": (50, 100),
    },

    "lung": {
        "name": "Lung",
        "bbb": 0.05,
        "vascular_permeability": 0.80,
        "ifp": 1.0,
        "density": 0.40,
        "ph": 6.9,
        "optimal_np_size": (40, 80),
    },

    "liver": {
        "name": "Liver",
        "bbb": 0.10,
        "vascular_permeability": 0.85,
        "ifp": 1.2,
        "density": 0.60,
        "ph": 6.9,
        "optimal_np_size": (30, 70),
    },

    "pancreas": {
        "name": "Pancreas",
        "bbb": 0.10,
        "vascular_permeability": 0.40,
        "ifp": 2.0,
        "density": 0.65,
        "ph": 6.7,
        "optimal_np_size": (20, 50),
    },

    "prostate": {
        "name": "Prostate",
        "bbb": 0.0,
        "vascular_permeability": 0.65,
        "ifp": 1.3,
        "density": 0.55,
        "ph": 6.8,
        "optimal_np_size": (50, 90),
    },

    "colon": {
        "name": "Colon",
        "bbb": 0.0,
        "vascular_permeability": 0.70,
        "ifp": 1.4,
        "density": 0.50,
        "ph": 6.8,
        "optimal_np_size": (50, 90),
    },

    "skin": {
        "name": "Skin (Melanoma)",
        "bbb": 0.0,
        "vascular_permeability": 0.60,
        "ifp": 0.5,
        "density": 0.30,
        "ph": 7.0,
        "optimal_np_size": (60, 120),
    },
}