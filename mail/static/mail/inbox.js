document.addEventListener('DOMContentLoaded', function() {
 
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

async function handleMailView(pMailID){
  if(pMailID){
    document.querySelector('#content-mail').innerHTML=''
    try {
      const mailID = await fetch(`/emails/${pMailID}`);
      const result = await mailID.json()

      if(result && !result.error){
        console.log(result)
        //Don't forget to make a function to hide the DIV's
        document.querySelector('#emails-view').style.display ='none';
        document.querySelector('#compose-view').style.display ='none';
        document.querySelector('#content-mail').style.display ='block';

        let mailBox = document.querySelector('#content-mail');
        let div = document.createElement('div')
        div.classList.add('mail-content')
        div.innerHTML = `
        <h2>${result['subject']}</h2>
        <p>Sender: <strong>${result['sender']}</strong></p>
        <div class="time-mail">${result['timestamp']}<p>
        <div class="mail-body">
          <p>${result['body']}</p>
        </div>
        <button>Reply</button>
        `
        mailBox.append(div)
      }
      
    } catch (error) {
      
    }
  }
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#content-mail').style.display ='none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  //Send mail
  document.querySelector('#compose-form').addEventListener('submit',async function(event){
    event.preventDefault()

    let composeRecipient = document.querySelector('#compose-recipients').value;
    let composeSubject = document.querySelector('#compose-subject').value;
    let composeBody = document.querySelector('#compose-body').value;

    if(composeRecipient && composeSubject && composeBody) {
      try {
        const compose_email = await fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
              recipients: composeRecipient,
              subject: composeSubject,
              body: composeBody
            })
          })
        const data = await compose_email.json()
        data && console.log(data.message)
        data.message === 'Email sent successfully.' ? load_mailbox('sent') : alert(data.error)
      } catch (error) {
        console.log(error)
      }
    }
  })
}

async function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#content-mail').style.display ='none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  try {
    const ajax= await fetch(`/emails/${mailbox}`);
    const result = await ajax.json();
    result && console.log(result);
    if(result){ 
      const body = document.querySelector('#emails-view')
      const emails = result.sort()
      let div = document.createElement('div')
      div.classList.add(`box-${mailbox}`)
      let ul =  document.createElement('ul')
    
      for(let email in emails) {
        let li = document.createElement('li');
        li.classList.add(`list-item`,`${emails[email]['read'] ?'bg-unread':'do-nothing'}`) 
        li.setAttribute('data-id',`${emails[email]['id']}`)
        li.innerHTML = `
          <div class="main-box-mail">
            <p>${mailbox == 'inbox'?'Sender: ': 'To: '}
              <strong>
              ${mailbox == 'inbox'? emails[email]['sender']: (emails[email]['recipients'].length == 1 ? emails[email]['recipients'][0]:emails[email]['recipients'][0] +',...')}
              </strong>
            </p>
            <p>Subject: <strong>${emails[email]['subject']}</strong></p>
          </div>
          <p>Date: <strong>${emails[email]['timestamp']}</strong></p>
        `
        ul.append(li)
      }
      div.append(ul)
      body.append(div)

      document.querySelectorAll('[data-id]').forEach(node => {
        node.addEventListener('click',(event)=>{
          event.preventDefault()
          handleMailView(node.dataset.id)
        })
      })
    }else{
      console.log('No results')
    }
  } catch (error) {
    console.log(error)
  }
}