import netCDF4 as nc
import numpy as np
import pprint as pp
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import pandas as pd

# Open the netCDF file
ncfile = nc.Dataset('data/pr_12km_MOHC-HadGEM2-ES_rcp26_r1i1p1_KNMI-RACMO22E_v2_day_20710101_20991231.nc')

# Read the data in the variable named 'pr'
pr = ncfile.variables['pr'][:]
# Read the data in the variable named 'time'
time = ncfile.variables['time'][:]
# Read the data in the variable named 'lat'
lat = ncfile.variables['lat'][:]
# Read the data in the variable named 'lon'
lon = ncfile.variables['lon'][:]
# Read the data in the variable named 'height'
print(np.sum(pr[:,:,:], axis=0).shape)
print(time.shape)
print(lat.shape)
print(lon.shape)
print(time)


# pp.pprint(pr[0,:,:])
# pp.pprint(lat)
# pp.pprint(lon)

# Plot the data
plt.figure()
plt.contourf(lon, lat, np.sum(pr[:,:,:], axis=0))
plt.colorbar()
plt.title('Precipitation')
plt.xlabel('Longitude')
plt.ylabel('Latitude')
plt.show()

start_year = 2070
data = []
for year in range(0, 30):
    for i in range(len(lat)):
        for j in range(len(lon)):
            data.append([start_year + year, lat[i]*10000, lon[j]*10000, np.sum(pr[year*365:(year+1)*365,i,j])])

df = pd.DataFrame(data, columns=['year', 'X', 'Y', 'pr'])
df.to_csv('data/precipitation_pred_2070_2100.csv', index=False)