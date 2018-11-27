var test = $.ajax('https://cdn.jsdelivr.net/gh/marcopoloq/AdventureLandPublic/testfile.js', {
    type: 'Get',
    dataType: "script",
    async: false,
    cache: true
  });

console.log(test)