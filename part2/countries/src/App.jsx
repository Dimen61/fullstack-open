import { useState, useEffect } from "react"
import axios from 'axios'

const API_KEY = import.meta.env.VITE_WEATHER_KEY

const API_URL = 'https://studies.cs.helsinki.fi/restcountries/api/all'

const createCityCoordAPIUrl = (city) => {
  return `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
}

const createWeatherAPIUrl = (lat, lon) => {
  return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
}

const FilterResponse = ({ text, matchedCountries, setMatchedCountry }) => {
  if (text != null) {
    return <div>{text}</div>
  } else if (matchedCountries != null) {
    return (
      <>
        {matchedCountries
          .map(country =>
            <div key={country.name.official}>
              {country.name.common}
              <button onClick={() => {
                setMatchedCountry(country)
              }}>
                Show
              </button>
            </div>)}
      </>
    )
  }

  return null
}

const WeatherOfCity = ({ city }) => {
  const [temperature, setTemperature] = useState(null)
  const [windSpeed, setWindSpeed] = useState(null)
  const [weatherIcon, setWeatherIcon] = useState(null)

  const cityCoordAPIUrl = createCityCoordAPIUrl(city)

  useEffect(() => {
    fetch(cityCoordAPIUrl)
      .then(response => response.json())
      .then(data => {
        const lat = data[0].lat
        const lon = data[0].lon

        console.log('lat: ', lat)
        console.info('lon: ', lon)

        return [lat, lon]
      })
      .then(([lat, lon]) => {
        const weatherAPIUrl = createWeatherAPIUrl(lat, lon)

        fetch(weatherAPIUrl)
          .then(response => response.json())
          .then(data => {
            const temp = data.main.temp
            const windSp = data.wind.speed
            const weaIcon = data.weather[0].icon

            console.log('temperature: ', temp)
            console.info('windSpeed: ', windSp)
            console.info('weather icon: ', weaIcon)

            setTemperature(temp)
            setWindSpeed(windSp)
            setWeatherIcon(weaIcon)
          })
          .catch(error => {
            console.error(error)
          })
      })
      .catch(error => {
        console.error(error)
      })
  }, [cityCoordAPIUrl])

  return (
    <>
      <h3>Weather in {city}</h3>
      <div>Temperature {temperature} Celsius</div>
      <img src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`} alt="Weather Icon" />
      <div>Wind {windSpeed}m/s</div>
    </>
  )
}

const CountryDisplayer = ({ country }) => {
  if (country == null) {
    return null
  }

  return (
    <>
      <h2>{country.name.common}</h2>
      <div>Capital {country.capital.join(", ")}</div>
      <div>Area {country.area}</div>

      <h3>Languages</h3>
      <ul>
        {Object.values(country.languages).map(lang => <li key={lang}>{lang}</li>)}
      </ul>

      <img src={country.flags.png} alt={country.name.common} />

      <WeatherOfCity city={country.capital[0]} />
    </>
  )
}

const App = () => {
  const [searchFilterText, setSearchFilterText] = useState('')
  const [responseText, setResponseText] = useState(null)
  const [matchedCountries, setMatchedCountries] = useState(null)
  const [matchedCountry, setMatchedCountry] = useState(null)


  useEffect(() => {
    console.log('useEffect called')

    axios.get(API_URL)
      .then(response => {
        console.log('response from API URL:', response.data)

        const totalMatchedCountryNames = response.data
          .map(country => ({
            country: country,
            countryName: country.name.common
          }))
          .filter(item => item.countryName.toLowerCase().includes(searchFilterText.toLowerCase()))

        if (totalMatchedCountryNames.length > 10) {
          setResponseText('Too many matches, specify another filter')
          setMatchedCountries(null)
          setMatchedCountry(null)
        } else if (totalMatchedCountryNames.length > 1) {
          setMatchedCountries(totalMatchedCountryNames.map(item => item.country))
          setMatchedCountry(null)
          setResponseText(null)
        } else if (totalMatchedCountryNames.length === 1) {
          setMatchedCountry(totalMatchedCountryNames[0].country)
          setMatchedCountries(null)
          setResponseText(null)
        }
      })
      .catch(error => {
        console.error(error)
      })
  }, [searchFilterText])

  const handleSearchFilterChange = (event) => {
    setSearchFilterText(event.target.value)
  }

  return (
    <>
      <div>
        find countries
        <input
          type="text"
          value={searchFilterText}
          onChange={handleSearchFilterChange} />
      </div>

      <FilterResponse
        text={responseText}
        matchedCountries={matchedCountries}
        matchedCountry={matchedCountry}
        setMatchedCountry={setMatchedCountry} />

      <CountryDisplayer country={matchedCountry}/>
    </>
  )
}

export default App
