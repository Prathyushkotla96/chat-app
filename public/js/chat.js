const socket=io()
//elements
const $messageform=document.querySelector('#message-form')
const $messageformInput=$messageform.querySelector('input')
const $messageformButton=$messageform.querySelector('button')
const $sendlocationbutton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationmessageTemplate=document.querySelector('#locationmessage-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
const{username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    // new message element
    const $newmessage=$messages.lastElementChild


    // height of the new message
    const newMessageStyles=getComputedStyle($newmessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newmessage.offsetHeight + newMessageMargin

    //visible height

    const visibleHeight=$messages.offsetHeight

    // height of messages container
    const containerHeight=$messages.scrollHeight

    // how far have i scrolled
    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight<=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight

    }

}





socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})



socket.on('locationmessage',(message)=>{
    //console.log(url)
    const html=Mustache.render(locationmessageTemplate,{
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



$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageformButton.setAttribute('disabled','disabled')

    const message=e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageformButton.removeAttribute('disabled')
        $messageformInput.value=''
        $messageformInput.focus()
        if (error){
            return console.log(error)
        }
        console.log('the message was delivered!')
    })
})



$sendlocationbutton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendlocationbutton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendlocationbutton.removeAttribute('disabled')
            console.log('location shared')
        })

    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})