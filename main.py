import netCDF4 as nc
import numpy as np
import pprint as pp
import matplotlib.pyplot as plt
import cartopy.crs as ccrs


# Open the netCDF file
ncfile = nc.Dataset('data/pr_12km_ICHEC-EC-EARTH_rcp26_r3i1p1_DMI-HIRHAM5_v1_day_19810101_20101231.nc')

# Read the data in the variable named 'pr'
pr = ncfile.variables['pr'][:]
# Read the data in the variable named 'time'
time = ncfile.variables['time'][:]
# Read the data in the variable named 'lat'
lat = ncfile.variables['lat'][:]
# Read the data in the variable named 'lon'
lon = ncfile.variables['lon'][:]
# Read the data in the variable named 'height'
# print(pr.shape)
# print(time.shape)
# print(lat.shape)
# print(lon.shape)


print(pr[0,:,:])

pp.pprint(lat)
pp.pprint(lon)

# Plot the data
plt.figure()
plt.contourf(lon, lat, pr[0,:,:])
plt.colorbar()
plt.title('Precipitation')
plt.xlabel('Longitude')
plt.ylabel('Latitude')
plt.show()


