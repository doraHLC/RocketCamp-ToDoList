const apiUrl = `https://todoo.5xcamp.us/`;

let jwt = '';

let toggleTab = "all";
const listItem = document.querySelector('.todoList_item');

const loginPage = document.querySelector('#loginPage');
const signUpPage = document.querySelector('#signUpPage');
const todoListPage = document.querySelector('#todoListPage');

// <!-- login_page -->
const loginEmail = document.querySelector('.js-loginEmail');
const loginPassword = document.querySelector('.js-loginPassword');
const loginSubmit = document.querySelector('.js-loginSubmit');
const loginSignUp = document.querySelector('.js-loginSignUp');

let userNickname = '';

loginSubmit.addEventListener('click', logIn);

function logIn() {
    if (loginEmail.value.trim() === '' || loginPassword.value.trim() === '') {
        Swal.fire({
            "icon": "question",
            "title": "請輸入帳號資料!"
        });
        return;
    }
    axios.post(`${apiUrl}users/sign_in`,
        {
            "user": {
                "email": loginEmail.value.trim(),
                "password": loginPassword.value.trim()
            }
        })
        .then(function (response) {
            console.log(response);
            jwt = response.headers.authorization;
            if (response.data.message == '登入成功') {
                swal.fire({
                    "icon": "success",
                    "title": "登入成功!"
                });
                loginPage.setAttribute("style", "display:none;");
                signUpPage.setAttribute("style", "display:none;");
                todoListPage.setAttribute("style", "display:block;")

                init();

                userNickname = response.data.nickname;
                const todoUser = document.querySelector('.todoUser');
                todoUser.textContent = `${userNickname}的代辦`;
            }
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                "icon": "error",
                "title": "帳號或密碼有誤，請重新登入或註冊新帳號!"
            });
        });
    loginEmail.value = '';
    loginPassword.value = '';
}

loginSignUp.addEventListener('click', function (e) {
    loginPage.setAttribute("style", "display:none;");
    signUpPage.setAttribute("style", "display:block;");
    todoListPage.setAttribute("style", "display:none;")
})

// <!-- sign up -->
const signUpEmail = document.querySelector('.js-signUpEmail');
const signUpNickname = document.querySelector('.js-signUpNickname');
const signUpPassword = document.querySelector('.js-signUpPassword');
const signUpPwdR = document.querySelector('.js-signUpPwdR');
const signupSubmit = document.querySelector('.js-signupSubmit');
const signUpLogin = document.querySelector('.js-signUpLogin');

signupSubmit.addEventListener('click', signUp);

signUpLogin.addEventListener('click', function (e) {
    loginPage.setAttribute("style", "display:block;");
    signUpPage.setAttribute("style", "display:none;");
    todoListPage.setAttribute("style", "display:none;")
})

function signUp() {
    if (signUpEmail.value.trim() === '' || signUpNickname.value.trim() === '' || signUpPassword.value.trim() === '' || signUpPwdR.value.trim() === '') {
        Swal.fire({
            "icon": "question",
            "title": "請輸入帳號資料!"
        });
        return;
    } else {
        if (signUpPassword.value.trim() !== signUpPwdR.value.trim()) {
            Swal.fire({
                "icon": "question",
                "title": "密碼長度或字元需相同!"
            });
            return;
        }
    }
    axios.post(`${apiUrl}users`,
        {
            "user": {
                "email": signUpEmail.value,
                "nickname": signUpNickname.value,
                "password": signUpPassword.value
            }
        }).then(function (response) {
            jwt = response.headers.authorization;

            if (response.data.message == '註冊成功') {
                swal.fire({
                    "icon": "success",
                    "title": "註冊成功!"
                });
                loginPage.setAttribute("style", "display:none;");
                signUpPage.setAttribute("style", "display:none;");
                todoListPage.setAttribute("style", "display:block;")

                init();
                userNickname = response.data.nickname;
                const todoUser = document.querySelector('.todoUser');
                todoUser.textContent = `${userNickname}的代辦`;
            }
        }).catch(function (error) {
            console.log(error);
            Swal.fire({
                "icon": "error",
                "title": "帳號已被使用或密碼字數至少6位!"
            })
        });
    signUpEmail.value = '';
    signUpNickname.value = '';
    signUpPassword.value = '';
    signUpPwdR.value = '';
}

// <!-- ToDo List -->
function init() {
    getTodolist();
}

init();


//getTodolist資料
function getTodolist() {
    axios.get(`${apiUrl}todos`,
        {
            headers: {
                'Authorization': jwt
            }
        }).then(function (response) {
            let listData;
            const todoListData = response.data.todos;

            updateList(todoListData);

            if (toggleTab === "all") {
                listData = todoListData
            } else if (toggleTab === "work") {
                listData = todoListData.filter((item) => {
                    return (item.completed_at === null)
                })
            } else if (toggleTab === "done") {
                listData = todoListData.filter((item) => {
                    return (item.completed_at !== null)
                })
            }

            const listTotal = document.querySelector('.js-listTotal');
            const doneListLength = todoListData.filter(function (item) {
                return (item.completed_at !== null)
            }).length;

            listTotal.textContent = doneListLength;

            updateList(listData);
        })
        .catch(function (error) {
            console.log(error);
        });
}

//addTodolist新增資料
const txtInput = document.querySelector('.js-txtInput');
const addItem = document.querySelector('.js-addItem');

addItem.addEventListener('click', addTodolist);

function addTodolist() {
    if (txtInput.value == '') {
        swal.fire({
            "icon": "question",
            "title": "請輸入內容"
        });
        return;
    }
    axios.post(`${apiUrl}todos`,
        {
            todo: {
                'content': txtInput.value.trim()
            }
        },
        {
            headers: {
                'Authorization': jwt,
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            txtInput.value = '';
            init();
            swal.fire({
                "icon": "success",
                "title": "新增成功!"
            });
        })
        .catch(function (error) {
            console.log(error);
        });

    init();
}

//list
function updateList(todoListData) {
    let str = '';

    todoListData.forEach(function (item) {
        const checked = item.completed_at !== null ? "checked" : "";

        str += `<li data-id="${item.id}">
                <label class="todoList_label">
                <input ${checked} class="todoList_input js-checked" type="checkbox">
                <span>${item.content}</span>
                </label>
                <i data-id="${item.id}" class="fa-solid fa-pen-to-square edit"></i>
                <i data-id="${item.id}" class="fa fa-times del"></i>
                </li>`
    });
    listItem.innerHTML = str;
}

//toggleList完成資料
listItem.addEventListener('click', toggleList);

function toggleList(e) {
    const id = e.target.closest('li').dataset.id;
    if (e.target.getAttribute("type") !== "checkbox") {
        return;
    }
    axios.patch(`${apiUrl}todos/${id}/toggle`, {},
        {
            headers: {
                'Authorization': jwt,
            }
        }).then(function (response) {
            console.log(response);
            init();
        }).catch(function (error) {
            console.log(error);
        });
}

//tab
const listTab = document.querySelector('.todoList_tab');
let tabs = document.querySelectorAll(".todoList_tab li");

listTab.addEventListener('click', tabChange);

function tabChange(e) {
    toggleTab = e.target.dataset.tab;
    tabs.forEach(function (item) {
        item.classList.remove("active");
    })
    e.target.classList.add("active");
    init();
}

//delTodolist刪除資料
listItem.addEventListener('click', delTodolist);

function delTodolist(e) {
    const id = e.target.closest('li').dataset.id;
    if (e.target.getAttribute("data-id") !== `${id}` || e.target.className !== 'fa fa-times del') {
        return;
    }

    axios.delete(`${apiUrl}/todos/${id}`,
        {
            headers: {
                'Authorization': jwt,
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            init();
            swal.fire({
                "icon": "success",
                "title": "刪除成功!"
            });
        }).catch(function (error) {
            console.log(error);
        });
}

//listClearAll刪除全部已完成資料
const listClear = document.querySelector('.listClear');

listClear.addEventListener('click', listClearAll);

function listClearAll() {
    axios.get(`${apiUrl}todos`,
        {
            headers: {
                'Authorization': jwt
            }
        }).then(function (response) {
            const doneList = response.data.todos.filter(function (item) {
                return (item.completed_at !== null)
            });
            const urls = doneList.map(function (item) {
                return (`${apiUrl}todos/${item.id}`)
            });
            Swal.fire({
                title: '清除全部已完成項目嗎?',
                text: "清除後將無法回復!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '是的，清除全部已完成項目!'
            }).then((result) => {
                if (result.isConfirmed) {
                    Promise.all(
                        urls.map(function (url) {
                            return (axios.delete((url),
                                {
                                    headers:
                                    {
                                        'Authorization': jwt,
                                        'Content-Type': 'application/json'
                                    }
                                }));
                        })
                    ).then(function (response) {
                        init();
                        Swal.fire({
                            icon: "success",
                            title: "已清除全部完成項目"
                        });
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            })
        })
}

//editTodolist修改資料
listItem.addEventListener('click', editTodolist);

function editTodolist(e) {
    const id = e.target.closest('li').dataset.id;
    if (e.target.getAttribute("data-id") !== `${id}` || e.target.className !== 'fa-solid fa-pen-to-square edit') {
        return;
    }

    Swal.fire({
        title: '輸入修改內容',
        input: 'text',
        inputLabel: '',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '沒有內容資訊'
            }
        }
    }).then(function (editTxt) {
        axios.put(`${apiUrl}/todos/${id}`,
            {
                "todo": {
                    "content": editTxt.value.trim()
                }
            },
            {
                headers: {
                    'Authorization': jwt
                }
            }).then(function (response) {
                init();
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    });
}

//logout使用者登出
const logOut = document.querySelector('.js-logOut');

logOut.addEventListener('click', function (e) {
    e.preventDefault();
    axios.delete(`${apiUrl}/users/sign_out`,
        {
            headers: {
                'Authorization': jwt,
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            swal.fire({
                "icon": "success",
                "title": "已登出!"
            });

            loginPage.setAttribute("style", "display:block;");
            signUpPage.setAttribute("style", "display:none;");
            todoListPage.setAttribute("style", "display:none;")
        }).catch(function (error) {
            console.log(error);
        });
})


















