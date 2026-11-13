"""Study catalog checks; no model execution or VISTA access is performed."""
import hashlib
import json
import math
from pathlib import Path
import unittest

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
DATA = PUBLIC / 'data'
HEADWATERS = {
    'Norris', 'Douglas', 'South Holston', 'Watauga', 'Fontana', 'Blue Ridge',
    'Normandy', 'Tims Ford', 'Chatuge', 'Nottely', 'Wolf Creek', 'Dale Hollow',
}


class NetworkCatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.network = json.loads((DATA / 'network.json').read_text())
        cls.geo = json.loads((DATA / 'geo.json').read_text())

    def test_requested_headwaters_are_complete_and_distinguished(self):
        sites = self.network['sites']
        self.assertEqual(len(sites), 54)
        self.assertEqual(len({site['id'] for site in sites}), 54)
        self.assertEqual(len({site['name'] for site in sites}), 54)
        self.assertEqual({site['name'] for site in sites if site['headwater']}, HEADWATERS)
        self.assertEqual(self.network['headwaterCount'], 12)
        self.assertEqual(self.network['siteCount'], 54)
        self.assertEqual(sum(not site['headwater'] for site in sites), 42)

    def test_original_model_matching_keys_do_not_change(self):
        # New site labels must not break identification of real agent CSV outputs.
        legacy = {site['id']: site for site in self.network['sites'] if site['modelSiteId']}
        self.assertEqual(set(legacy), {'ELF{:02d}'.format(n) for n in range(1, 53)})
        for ident, site in legacy.items():
            self.assertEqual(site['modelSiteId'], ident)
        self.assertEqual(legacy['ELF13']['name'], 'Norris')
        self.assertEqual(legacy['ELF01']['name'], 'Douglas')
        self.assertEqual(legacy['ELF39']['name'], 'Normandy')

    def test_added_reservoirs_do_not_invent_model_or_forcing_coverage(self):
        added = [site for site in self.network['sites'] if site['modelSiteId'] is None]
        self.assertEqual({site['name'] for site in added}, {'Wolf Creek', 'Dale Hollow'})
        for site in added:
            self.assertIsNone(site['regionId'])
            self.assertTrue(site['headwater'])
            self.assertIn('must be established before inference', site['studyNote'])
            self.assertIn('USGS lake station', site['locationType'])
            self.assertTrue(site['coordinateSource'].startswith('https://waterdata.usgs.gov/'))

    def test_geography_is_complete_without_mislabeling_centroids_as_dams(self):
        regions = {feature['properties']['id'] for feature in self.geo['features']}
        for site in self.network['sites']:
            self.assertTrue(math.isfinite(site['lat']))
            self.assertTrue(math.isfinite(site['lon']))
            self.assertGreater(site['lat'], 33)
            self.assertLess(site['lat'], 39)
            self.assertGreater(site['lon'], -91)
            self.assertLess(site['lon'], -80)
            if site['regionId']:
                self.assertIn(site['regionId'], regions)
                self.assertEqual(site['locationType'], 'forcing-region centroid')
        self.assertIn('not dam outlets or gage positions', self.network['mapNote'])
        self.assertIn('not a site type', self.network['quantityNote'])

    def test_geographic_source_images_remain_original_assets(self):
        self.assertEqual(len(self.network['referenceImages']), 2)
        for reference in self.network['referenceImages']:
            path = PUBLIC / reference['url'].lstrip('/')
            self.assertTrue(path.is_file())
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), reference['sha256'])

    def test_offline_evaluation_artifacts_are_not_shipped_as_current_results(self):
        self.assertFalse((DATA / 'demo.json').exists())
        self.assertFalse((DATA / 'pilot.json').exists())
        self.assertFalse((DATA / 'recorded').exists())
        self.assertTrue(all('recordedWeeks' not in site and 'series' not in site
                            for site in self.network['sites']))


if __name__ == '__main__':
    unittest.main()
