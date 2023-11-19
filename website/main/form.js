function myfunction() {
  console.log("here")
  // Gather form data
  let searchValue = document.getElementById('search').value;
  // console.log('loggin')
  fetch('http://127.0.0.1:8000/create', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ search: searchValue })
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch((error) => {
    console.error('Error:', error);
  });
}