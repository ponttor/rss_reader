import * as yup from 'yup';
// import { string, object } from 'yup';

// const schema = object().shape({
//   name: string().required(),
// });

const schema = yup.object().shape({
  name: yup.string().required(),
});

// check validity
schema
  .isValid({
    name: 'jimmy',
  })
  .then((content) => console.log(content));
