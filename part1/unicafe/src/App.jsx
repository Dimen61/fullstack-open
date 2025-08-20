import { useState } from "react"

const Button = ({ onClick, text }) => <button onClick={onClick}>{text}</button>

const Feedback = ({ onClickForGood, onClickForNeutral, onClickForBad }) => {
  return (
    <>
      <h2>give feedback</h2>
      <div>
        <Button onClick={onClickForGood} text='good' />
        <Button onClick={onClickForNeutral} text='neutral' />
        <Button onClick={onClickForBad} text='bad' />
      </div>
    </>
  )
}

const StatisticLine = ({ text, value}) => {
  return (
    // <div>{text} {value}</div>
    <tr>
      <th>{text}</th>
      <th>{value}</th>
    </tr>
  )
}

const Statistics = ({ good, neutral, bad }) => {
  const average= (good - bad) / (good + neutral + bad)
  const positivePercentage = 100 * good / (good + neutral + bad)

  if (good + neutral + bad > 0) {
    return (
      <>
          <h2>statistics</h2>
          <table>
            <tbody>
              <StatisticLine text='good' value={good} />
              <StatisticLine text='neutral' value={neutral} />
              <StatisticLine text='bad' value={bad} />

              <StatisticLine text='average' value={average} />
              <StatisticLine text='positive' value={`${positivePercentage}%`} />
            </tbody>
          </table>
      </>
    )
  }

  return (
    <>
      <h2>statistics</h2>
      <p>No feedback given</p>
    </>
  )

}

const App = () => {
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  const onClickToIncrease = (x, setX) => {
    return () => setX(x + 1)
  }
  const onClickForGood = () => onClickToIncrease(good, setGood)()
  const onClickForNeutral = onClickToIncrease(neutral, setNeutral)
  const onClickForBad = onClickToIncrease(bad, setBad)

  return (
    <div>
      <Feedback onClickForGood={onClickForGood} onClickForNeutral={onClickForNeutral} onClickForBad={onClickForBad} />
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App
