const Header = ({ text }) => <h2>{text}</h2>

const Content = ({ parts }) => (
  <div>
    {
      parts.map(part => <Part part={part} key={part.id} />)
    }
  </div>
)

const Part = ({ part }) => (
  <p>
    {part.name} {part.exercises}
  </p>
)

const Total = ({ parts }) => {
  return  (
    <p><b>Number of exercises { parts.reduce((acc, part) => acc + part.exercises, 0)}</b></p>
  )
}

const Course = ({ course }) => {
  return (
    <>
      <Header text={course.name} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </>
  )
}

export default Course
