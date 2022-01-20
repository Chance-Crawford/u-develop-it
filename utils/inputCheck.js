// utility to check if an object has the required properties
// e.g., inputCheck(object, 'prop1', 'prop2', 'etc')

module.exports = function(obj, ...props) {
  const errors = [];

  props.forEach((prop) => {
    // if property is blank or doesn't exist, add to errors array
    if (obj[prop] === undefined || obj[prop] === '') {
      errors.push(`No ${prop} specified.`);
    }
  });

  // If the inputCheck() function returns an error, an error 
  // message is returned to the client as a 400 status code, 
  // to prompt for a different user request with a JSON object 
  // that contains the reasons for the errors.
  if (errors.length) {
    return {
      error: errors.join(' ')
    };
  }
  
  return null;
};