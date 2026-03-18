export interface PropertyWeather {
  propertyId: string
  location: string
  temperature: number
  condition: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'partly_cloudy' | 'windy'
  icon: string
  high: number
  low: number
  note?: string
}

export const PROPERTY_WEATHER: PropertyWeather[] = [
  { propertyId: 'p1', location: 'Oslo', temperature: 4, condition: 'snow', icon: '❄️', high: 6, low: -1, note: 'Light snow this morning' },
  { propertyId: 'p2', location: 'Bergen', temperature: 7, condition: 'rain', icon: '🌧️', high: 9, low: 5, note: 'Heavy rain expected 14:00-18:00' },
  { propertyId: 'p3', location: 'Stavanger', temperature: 9, condition: 'partly_cloudy', icon: '⛅', high: 12, low: 6 },
  { propertyId: 'p4', location: 'Oslo', temperature: 4, condition: 'snow', icon: '❄️', high: 6, low: -1 },
  { propertyId: 'p5', location: 'Lillehammer', temperature: -3, condition: 'snow', icon: '🌨️', high: 0, low: -6, note: 'Heavy snow — check driveway access' },
]
