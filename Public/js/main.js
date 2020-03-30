const socket = io();
const chatform = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//Get the Username and room 
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

//Join chatroom
socket.emit('joinroom', {username, room})

//Get room and users
socket.on('roomUsers', ({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
})

//Message From Server
socket.on('message', message=>{
    console.log(message)
    outputMessage(message)

    //Scroll Down automatically
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//Submit Messge
chatform.addEventListener('submit', (e)=>{
    e.preventDefault()

    //Getting message text
    const msg = e.target.elements.msg.value

    //Emitting Chat message to server
    socket.emit('chatMsg', msg)

    //Clear Input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus()
})

//Output Message to DOM 
function outputMessage(message){
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta"> ${message.username} <span> ${message.time} </span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div)
}

//Add room name to DOM
function outputRoomName(room){
    roomName.innerText =  room;
}

//Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
      ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
  }