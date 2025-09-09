import { useState, useEffect } from "react";
import personService from "./services/persons";

const MsgStatus = {
  SUCCESS: "success",
  ERROR: "error",
};

const Notification = ({ msg, msgStatus }) => {
  const successStyle = {
    color: "green",
    background: "lightgrey",
    fontSize: 20,
    borderStyle: "solid",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  };

  const errorStyle = {
    color: "red",
    background: "lightgrey",
    fontSize: 20,
    borderStyle: "solid",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  };

  if (msg === null) {
    return null;
  }

  return (
    <div style={MsgStatus.SUCCESS === msgStatus ? successStyle : errorStyle}>
      {msg}
    </div>
  );
};

const Person = ({ person, handlePersonDelete }) => {
  return (
    <p key={person.id}>
      {person.name} {person.number}{" "}
      <button onClick={handlePersonDelete}>delete</button>
    </p>
  );
};

const Numbers = ({ persons, setPersons, filterText, setNotificationMsg, setNotificationMsgStatus }) => {
  const generateHandlerPersonDelete = (person) => {
    return () => {
      if (window.confirm(`Delete ${person.name}?`)) {
        personService
          .deletePersonOnBackend(person.id)
          .then((deletedPerson) =>
            setPersons(persons.filter((p) => p.id !== deletedPerson.id)),

            setNotificationMsgStatus(MsgStatus.SUCCESS),
            setNotificationMsg(`Deleted ${person.name}`)
          )
          .catch(error => {
            console.error("Error deleting person:", error);

            setNotificationMsgStatus(MsgStatus.ERROR);
            setNotificationMsg(`Error deleting ${person.name}`);
          });
      }
    };
  };

  return (
    <>
      {persons
        .filter((person) => person.name.startsWith(filterText))
        .map((person) => (
          <Person
            key={person.id}
            person={person}
            handlePersonDelete={generateHandlerPersonDelete(person)}
          />
        ))}
    </>
  );
};

const Filter = ({ setFilterText }) => {
  const handlerFilterChange = (event) => {
    const filterText = event.target.value;
    setFilterText(filterText);
  };

  return (
    <div>
      filter shown with <input type="text" onChange={handlerFilterChange} />
    </div>
  );
};

const NewAdder = ({ persons, setPersons, setNotificationMsg, setNotificationMsgStatus}) => {
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const addPerson = (event) => {
    event.preventDefault();

    if (!newName) {
      alert("Please input the name");
    } else if (!newNumber) {
      alert("Please input the number");
    } else {
      const person = persons.find((person) => person.name === newName);
      if (person != undefined) {
        console.info(`find the same name person...`);
        if (person.number !== newNumber) {
          if (
            window.confirm(
              `${person.name} is already added to phonebook. Replace the number?`,
            )
          ) {
            personService
              .updatePersonOnBackend(person.id, {
                name: person.name,
                number: newNumber,
              })
              .then((retPerson) => {
                setPersons(
                  persons.map((p) => (p.name == newName ? retPerson : p)),
                );

                setNewName("");
                setNewNumber("");
                setNotificationMsg(`Updated ${retPerson.name}`);
                setNotificationMsgStatus(MsgStatus.SUCCESS);
              })
              .catch(error => {
                console.error("Error updating person:", error);

                if (error.response && error.response.status === 404) {
                  setNotificationMsg(
                    `Information of ${person.name} has already been removed from server`
                  );
                  setPersons(persons.filter(p => p.id !== person.id));
                } else {
                  setNotificationMsg(`Failed to update ${person.name}`);
                }

                setNotificationMsgStatus(MsgStatus.ERROR);
              })
          }
        }
      } else {
        personService
          .createPersonOnBackend(newName, newNumber)
          .then((retPerson) => {
            setPersons(persons.concat(retPerson));
            setNewName("");
            setNewNumber("");
            setNotificationMsg(`Created ${retPerson.name}`);
            setNotificationMsgStatus(MsgStatus.SUCCESS);
          })
          .catch((error) => {
            console.error("Error adding person:", error);

            setNotificationMsg(`Failed to create ${newName}`);
            setNotificationMsgStatus(MsgStatus.ERROR);
          });
      }
    }
  };

  const handlePersonChange = (event) => {
    const newPersonName = event.target.value;
    setNewName(newPersonName);
  };

  const handleNumberChange = (event) => {
    const newNumber = event.target.value;
    setNewNumber(newNumber);
  };

  return (
    <form onSubmit={addPerson}>
      <div>
        name:{" "}
        <input type="text" value={newName} onChange={handlePersonChange} />
      </div>
      <div>
        number:{" "}
        <input type="text" value={newNumber} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [filterText, setFilterText] = useState([]);
  const [notificationMsg, setNotificationMsg] = useState(null);
  const [notificationMsgStatus, setNotificationMsgStatus] = useState(null);

  useEffect(() => {
    console.info("useEffect");

    personService
      .getPersonsOnBackend()
      .then((retPersons) => {
        setPersons(retPersons);
      })
      .catch((error) => {
        console.error("Error fetching persons:", error);

        setNotificationMsgStatus(MsgStatus.ERROR);
        setNotificationMsg(error);
      });
  }, []);

  useEffect(() => {
    if (notificationMsg) {
      const timer = setTimeout(() => {
        setNotificationMsg(null);
      }, 1500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [notificationMsg]);

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification msg={notificationMsg} msgStatus={notificationMsgStatus} />
      <Filter setFilterText={setFilterText} />

      <h3>Add a new</h3>
      <NewAdder
        persons={persons}
        setPersons={setPersons}
        setNotificationMsg={setNotificationMsg}
        setNotificationMsgStatus={setNotificationMsgStatus}
      />

      <h3>Numbers</h3>
      <Numbers
        persons={persons}
        setPersons={setPersons}
        filterText={filterText}
        setNotificationMsg={setNotificationMsg}
        setNotificationMsgStatus={setNotificationMsgStatus}
      />
    </div>
  );
};

export default App;
