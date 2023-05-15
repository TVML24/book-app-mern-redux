const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  // list of queries
  Query: {
    // query for me
    // async function to use await on findOne later on 
    me: async (parent, args, context) => {
      // if context.user exists
      if (context.user) {
      // userData becomes the user we want to select (located by it's id)
        const userData = await User.findOne({ _id: context.user._id })
      // we ommit unnecessary data from the return
          .select('-__v -password')
      // we populate the saved books property from the bookschema
          .populate('savedBooks');
      // this userdata is returned
        return userData;
      }
      // if there is no userdata, we throw an authentication error because the user needs to log in first. 
      throw new AuthenticationError('Please Log In!');
    },
  },
  // list of mutations
  Mutation: {
    // mutation for login
    // async function to allow await to be used for other functions
    // passed the email and password as parameters
    login: async (parent, { email, password }) => {
    // email from input passed as parameter is used to locate user in the db
      const user = await User.findOne({ email });
    // if there is no user that corresponds to that email throw authentication error - the user does not exist yet.
      if (!user) {
        throw new AuthenticationError('No user exists with that email!');
      }
    // we designate correctPW as the return of iscorrect password method passed the password parameter from the password input. 
      const correctPw = await user.isCorrectPassword(password);
    // If the password does not match the password stored for that user we throw error
      if (!correctPw) {
        throw new AuthenticationError('That username or password does not exist!');
      }
    // otherwise token is equal to sign token method passed the parameter of user
      const token = signToken(user);
    // return both the token and the user
      return { token, user };
    },
    // for adding a user
    addUser: async (parent, args) => {
    // call user.create with the args passed to it
      const user = await User.create(args);
    // define the token by using the signtoken method with the parameter of the user passed to it 
      const token = signToken(user);
    // return both the token and the user
      return { token, user };
    },
    // removing a book from a users savedbooks
    // aysnc function to allow for await on find one and update
    // passed the bookId as the parameter
    removeBook: async (parent, { bookId }, context) => {
    // if the user exists (from the header/token- meaning the user is logged in)
      if (context.user) {
    // we call findone and update on the logged in user, taking their id from the header/token
        const updatedBooks = await User.findOneAndUpdate(
          { _id: context.user._id },
    // we use $pull to remove the savedbook from the list of saved books by matching it to the book id
          { $pull: { savedBooks: { bookId } } },
    // we return the updated list, not the old one
          { new: true }
        );
    // final return is updated books
        return updatedBooks;
      }
    },
    // to save a book to a users saved books
    // async function to allow for await on findone and update 
    // passed the booktosave as the parameter 
    saveBook: async (parent, { bookId }, context) => {
    // if the user is logged in (and hence context.user exists)
      if (context.user) {
    // updated books is defined as the outcome of findone and update called on the user
        const updatedBooks = await User.findOneAndUpdate(
    // we locate the user with the user id passed from the header/token context 
          { _id: context.user._id },
    // we use $addToSet to add the chosen book to the users savedBooks 
          { $addToSet: { savedBooks: bookId } },
    // we tell it to return the new info - not the original info
          { new: true }
    // we populate saved books again with the new info as it has changed. 
        ).populate('savedBooks');
    // return updated books
        return updatedBooks;
      }
    // if the user is not logged on throw the error
      throw new AuthenticationError('You need to log in!');
    },
  },
};

module.exports = resolvers;