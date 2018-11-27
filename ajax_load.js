var test = $.ajax('https://raw.githubusercontent.com/marcopoloq/AdventureLandPublic/master/testfile.js', {
    type: 'Get',
    dataType: "script",
    async: false,
    cache: true
  });

console.log(test)