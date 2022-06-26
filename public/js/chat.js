
const socket=io()
// elements
const $messageForm=document.querySelector('#message-form')
const $messageFromInput=$messageForm.querySelector('input')
const $messageFromButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages= document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options

const{username, room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    //new message
    const newMessage=$messages.lastElementChild

    //hight of new message
    const newMessageStyle=getComputedStyle(newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHight=newMessage.offsetHeight +newMessageMargin

    //visible hight
    const visibleHeight=$messages.offsetHeight

    //hight of message container
    const containerHeight=($messages.scrollHeight)

    // how far have i scrolled
    const scrollOffSet=$messages.scrollTop + visibleHeight
    $messages.scrollTop=$messages.scrollHeight
    // if(containerHeight - newMessageHight <= scrollOffSet){
    //     $messages.scrollTop=$messages.scrollHeight
    // }
}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationmessage',(message)=>{
    console.log(message.url)
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFromButton.setAttribute('disabled','disabled')
    //disable
    const message=e.target.elements.message.value
    socket.emit('sendmessage',message, (error)=>{
        $messageFromButton.removeAttribute('disabled')
        $messageFromInput.value=''
        $messageFromInput.focus()
        //enable
        if(error){
            return console.log(error)
        }
        console.log("message delivered")
    })
})

$sendLocationButton.addEventListener('click', ()=>{
    
    if(!navigator.geolocation){
        return alert('Geolocation is not support by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled') //disable
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendlocation',{
            latitude:position.coords.latitude,
             longitude:position.coords.longitude
            },()=>{
                $sendLocationButton.removeAttribute('disabled')
                console.log('Location shared')
            })
    })
})


socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})

