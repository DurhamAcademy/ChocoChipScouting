const http = require('http');
http.get('http://0.0.0.0:3000/', res => {
  let data = [];
  const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
  console.log('Status Code:', res.statusCode);
  console.log('Date in Response header:', headerDate);
  res.on('data', chunk => {
    data.push(chunk);
  });
  res.on('end', () => {
    console.log('Response ended: ');
    const users = Buffer.concat(data).toString();
    console.log(users)
    if (res.statusCode !== 200) {
      process.exit(1);
    } else process.exit()
  });
}).on('error', err => {
  process.exit(1);
});