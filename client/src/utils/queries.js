import { gql } from '@apollo/client';

// returns the user and all of their saved books
export const GET_ME = gql`
  {
    me {
      _id
      username
      bookCount
      email
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;