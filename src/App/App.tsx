import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation, Auth} from 'aws-amplify'
import { createTodo } from '../graphql/mutations'
import { listTodos } from '../graphql/queries'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import awsExports from "../aws-exports";
import jwtDecode from 'jwt-decode';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonTextarea,
  IonCard,
  IonList,
  IonItem,
} from '@ionic/react';
import IonicWrap from './IonicWrap';

Amplify.configure(awsExports);


const App: React.FC = () => {
  Auth.currentSession().then(res=>{
    let accessToken = res.getAccessToken()
    let idToken = res.getIdToken();
    let jwt = accessToken.getJwtToken()
    //You can print them to see the full objects
    console.log(`myAccessToken: ${JSON.stringify(accessToken)}`)
    console.log(`myJwt: ${jwt}`)
    console.log('decoded jwt', jwtDecode(jwt))
    console.log('id-token', idToken)
    console.log('decoded id-token', idToken.decodePayload())

  })

  const initialState = { name: '', description: '' }
  const [formState, setFormState] = useState(initialState)
  const todoInit:any[] = [];
  const [todos, setTodos] = useState(todoInit)

  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key:string, value:string) {
    setFormState({ ...formState, [key]: value })
    console.log('form state set!', key, value);
  }

  async function fetchTodos() {
    try {
      const todoData:any = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }


  return (
    <IonicWrap>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Amplify Test</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Blank</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonCard>
            <div>
              <AmplifySignOut/>
              <IonInput
                onInput={(e:any) => setInput('name', e.target.value)}
                value={formState.name}
                placeholder="Name"
              />

            </div>
            <div>
            <IonTextarea
              onInput={(e:any) => setInput('description', e.target.value)}

              value={formState.description}
              placeholder="Description"
            />
            </div>
            <div>
              <IonButton onClick={addTodo}>Add New</IonButton>
            </div>
          </IonCard>
          <IonList>
            {
              todos.map((todo, index) => (
                <IonItem key={todo.id ? todo.id : index}>
                  {todo.name} - {todo.description}
                </IonItem>
              ))
            }
          </IonList>
        </IonContent>
      </IonPage>
    </IonicWrap>
  )
};

export default withAuthenticator(App);
