import { result } from 'lodash';
import * as yup from 'yup';
// import { string, object } from 'yup';

const schema = yup.object().shape({
  name: yup.string().required(),
});

const data = {
  name: 'ggj',
};

schema
  .isValid({
    name: data.name,
  })
  .then((content) => {
    console.log(content);
  });




// console.log(data.name);
// console.log(schema.validateSync(data));

// console.log(handle(data));
