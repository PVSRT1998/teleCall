async function chatClientCreate(responseData) {
    // let token = await responseData.token;
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJpc3MiOiJTS2VmNTU0ZjBhMDhkYzU5YmNmNDA0ZmZlODRiY2M2YWYzIiwiZXhwIjoxNjM2MDg0NTM3LCJqdGkiOiJTS2VmNTU0ZjBhMDhkYzU5YmNmNDA0ZmZlODRiY2M2YWYzLTE2MzYwODA5MzciLCJzdWIiOiJBQzE3NDg5YjdjOTVmMmNjNWYzZTMyNTY5OWQ4MmVlNGUyIiwiZ3JhbnRzIjp7ImlkZW50aXR5IjoiZ25hcmF5YW5hQGdtYWlsLmNvbSIsImNoYXQiOnsic2VydmljZV9zaWQiOiJhYmMtMTIzLTM0NS01Njc3In19fQ.OmPmIh4A60GpF1E-3hFVvRd0G1WPDk5YekZoteQIchg";

    console.log(Twilio);
    let client = await Twilio.Chat.Client.create(token);
    console.log(client);
}