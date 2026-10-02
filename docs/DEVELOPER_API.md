# Developer API

## Vehicles
registerVehiclePack(name, path)  
setVehicleForLevel(level, id)

## Homes
registerHomePack(name, path)  
setHomeForLevel(level, id)

## Pets
registerPetPack(name, path)  
setPetSelection(id)

## Backdrops
registerBackdropPack(name, path)  
setBackdrop(id)

## Weather
registerWeatherPack(name, path)  
setWeather(id)

## Collectibles
registerCollectiblePack(name, path)  
addCollectible(id)

## Gig Machines
registerTransportAnimation(species, path)  
registerDeliveryItem(id, path)  
registerShoppingItem(id, path)

## Continuity
refillMeter(id, amount)  
consumeMeter(id, amount)

## Receipts
registerReceiptSource(id)  
scanReceipt(data)