import unittest

from ui import calculate_penetration_depth, get_tissue_properties


class TissuePropertiesTests(unittest.TestCase):
    def test_known_locations_have_realistic_properties(self):
        brain = get_tissue_properties("Brain")
        self.assertEqual(brain["location"], "Brain")
        self.assertGreater(brain["porosity"], 0)
        self.assertLess(brain["porosity"], 1)
        self.assertIn("description", brain)

    def test_penetration_depth_uses_tissue_properties(self):
        depth = calculate_penetration_depth(
            location="Liver",
            diameter=10,
            nanoparticle=100,
            concentration=2.5,
        )
        self.assertGreater(depth, 0)


if __name__ == "__main__":
    unittest.main()
