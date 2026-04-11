export interface DayForecast {
  date: string
  dayOfWeek: string
  high: number
  low: number
  condition: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'partly_cloudy' | 'windy'
  precipChance: number
  alert?: string
}

export const STAY_FORECAST: DayForecast[] = [
  { date: 'Mar 22', dayOfWeek: 'Sat', high: 8, low: 2, condition: 'partly_cloudy', precipChance: 20 },
  { date: 'Mar 23', dayOfWeek: 'Sun', high: 6, low: 1, condition: 'rain', precipChance: 80, alert: 'Bring an umbrella — rain expected all afternoon' },
  { date: 'Mar 24', dayOfWeek: 'Mon', high: 5, low: -1, condition: 'rain', precipChance: 70, alert: 'Wet morning — plan indoor activities' },
  { date: 'Mar 25', dayOfWeek: 'Tue', high: 7, low: 0, condition: 'cloudy', precipChance: 30 },
  { date: 'Mar 26', dayOfWeek: 'Wed', high: 10, low: 3, condition: 'sunny', precipChance: 5 },
  { date: 'Mar 27', dayOfWeek: 'Thu', high: 9, low: 2, condition: 'partly_cloudy', precipChance: 15 },
]

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
