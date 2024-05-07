import { SignupType } from "@atharv1608/common-app";
import { ChangeEvent, useState } from "react";
import { Link , useNavigate } from "react-router-dom"
import axios from "axios";
import { BACKEND_URL } from "../Config";


export const Auth = ({type}: {type : "signup" | "signin"} )=>{

    const navigate = useNavigate();

    const [postInputs,setPostInputs] = useState<SignupType>({
        name: "",
        email: "",
        password: ""
    })

  async  function sendRequest(){
        try{
          const resposne = await axios.post(`${BACKEND_URL}/api/v1/user/${type === 'signup' ? "signup":"signin"}`, postInputs) 
          const jwt = resposne.data;
          console.log(jwt)
          localStorage.setItem("token", jwt.jwt);
          navigate("/blogs");
        }
        catch(e){
            alert("unsuccessfull!")
        }
    }

    return <div className=" h-screen flex justify-center flex-col">
        <div className="flex justify-center">
            <div>
            <div className="text-4xl font-extrabold">
                Create an account
            </div>
            <div className="tetx-slate-400 pl-9">
            {type === "signin" ? "Don't have an account?" : "Already have an account?" }
            <Link className="pl-2 underline" to={type === "signin" ? "/signup" : "/signin"}>
                            {type === "signin" ? "Sign up" : "Sign in"}
                        </Link>
            </div>
            { type=== "signup" ? <LabelledInput label="Name" placeholder="Atharv Deorukhkar" onChange={(e) =>{
                setPostInputs({
                    ...postInputs,
                    name: e.target.value
                })
            }} /> : null }
            <LabelledInput label="Username" placeholder="atharv123@gmail.com" onChange={(e) =>{
                setPostInputs({
                    ...postInputs,
                    email: e.target.value
                })
            }} />
            <LabelledInput label="password" type="password" placeholder="12345" onChange={(e) =>{
                setPostInputs({
                    ...postInputs,
                    password: e.target.value
                })
            }} />
            <button type="button" onClick={sendRequest} className="text-white bg-gray-800 mt-4 w-full font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                {type === "signin" ? "Login" : "Signup"}
            </button>
            </div>
        </div>
    </div>
}

interface LabelledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

function LabelledInput({ label, placeholder, onChange, type }: LabelledInputType) {
    return <div>
        <label className="block mb-2 text-sm text-black font-semibold pt-4">{label}</label>
        <input onChange={onChange} type={type || "text"}  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder={placeholder} required />
    </div>
}