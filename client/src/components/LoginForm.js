// see SignupForm.js for comments
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
// grab the usemutation method for the function
import { useMutation } from '@apollo/client';
// import the login mutation from the utils
import { LOGIN_USER } from '../utils/mutations';
// import auth from the utils
import Auth from '../utils/auth';

// set the default form state
const [formState, setFormState] = useState({ email: '', password: '' });


const LoginForm = () => {
  // sets the default state for validated
  const [validated] = useState(false);
  // sets the default state for showalert
  const [showAlert, setShowAlert] = useState(false);
  // instructions for the function to use to log the user in 
  const [login, { error }] = useMutation(LOGIN_USER);

  // on change the target of the event has it's value set to the input
  const handleInputChange = (event) => {
    const { name, value } = event.target;
  // sets userformdata to the value of the event so you can see what you are typing
    setUserFormData({ ...userFormData, [name]: value });
  };

  // handles the form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    // check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
// calls login with the variables from form state (password, username)
    try {
      const { data } = await login({
        variables: { ...formState },
      });
      Auth.login(data.login.token);
    } catch (e) {
      console.error(e);
    }
  };


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
          Something went wrong with your login credentials!
        </Alert>
        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your email'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
