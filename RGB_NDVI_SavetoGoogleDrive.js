// Load a collection of Landsat 8 TOA reflectance images
var landsatCollection = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA');

// Define the center point of interest (Halifax, Nova Scotia)
var centerPoint = ee.Geometry.Point([-63.6509, 44.6509]);

// Define a rectangular bounding box around the center point
var roi = centerPoint.buffer(5000).bounds(); // Adjust the buffer size as needed

// Function to mask clouds in Landsat 8 imagery
var maskClouds = function(image) {
  var score = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');
  var mask = score.lt(10);
  return image.updateMask(mask);
};

// Function to add an NDVI band to the image
var addNDVI = function(image) {
  var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
  return image.addBands(ndvi).float();
};

// Filter the Landsat collection by date and ROI, then apply cloud masking
var harmonicLandsat1 = landsatCollection
  .filterDate('2015-01-01', '2024-01-01')
  .filterBounds(roi)
  .map(maskClouds);

// Filter the Landsat collection by date and ROI, apply cloud masking and NDVI calculation
var harmonicLandsat2 = landsatCollection
  .filterDate('2015-01-01', '2024-01-01')
  .filterBounds(roi)
  .map(maskClouds)
  .map(addNDVI);


var visualization1 = {
  bands: ['B4', 'B3', 'B2'],
  min: 0.0,
  max: 0.3,
};

var visualization2 = {
  bands: ['B5', 'B4', 'B3'],
  min: 0.0,
  max: 0.3,
};


Map.centerObject(roi, 11);

// Map.addLayer(roi, {}, 'ROI');

Map.addLayer(harmonicLandsat1, visualization1, 'RGB');

Map.addLayer(harmonicLandsat2, visualization2, 'NDVI');



// Compute median images for export
var rgbImage = harmonicLandsat1.median().select(['B4', 'B3', 'B2']).float(); // Ensure all bands are float32
var ndviImage = harmonicLandsat2.median().select('NDVI').float(); // Ensure NDVI is float32

// Define export parameters
var exportParams = {
  scale: 30, // Define the resolution (30 meters for Landsat 8)
  region: roi, // Use the rectangular ROI for export
  fileFormat: 'GeoTIFF',
  crs: 'EPSG:4326' // Coordinate reference system
};

// Export NDVI image to Google Drive
Export.image.toDrive({
  image: rgbImage,
  description: 'Halifax_rgb_2015_2024',
  folder: 'GEE_Exports',
  scale: 30, // Define the resolution (30 meters for Landsat 8)
  region: roi, // Use the rectangular ROI for export
  fileFormat: 'GeoTIFF',
  crs: 'EPSG:4326' // Coordinate reference system
});


// Export NDVI image to Google Drive
Export.image.toDrive({
  image: ndviImage,
  description: 'Halifax_NDVI_2020',
  folder: 'GEE_Exports',
  scale: 30, // Define the resolution (30 meters for Landsat 8)
  region: roi, // Use the rectangular ROI for export
  fileFormat: 'GeoTIFF',
  crs: 'EPSG:4326' // Coordinate reference system
});

// Log export information to the console
print('Export tasks have been started.');
