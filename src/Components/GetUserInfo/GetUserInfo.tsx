import { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { message } from 'antd';
import { setAccountInfo, setIsAdmin } from '../../Features/connectionSlice';
import { fetchUserInformation } from '../../service/userInformation';

function GetUserInfo() {
    const dispatch = useDispatch();

    useEffect(() => {
        getUserInformation();
    }, []);

    const getUserInformation = async () => {
        const response = await fetchUserInformation();
        if (response) {
            if (response.status === 200) {
                dispatch(setAccountInfo(response.data));
                if (response.data.accountRole === "ADMIN") {
                    dispatch(setIsAdmin(true));
                } else {
                    location.assign("https://agent.pindias.com/");
                }
            } else {
                message.error(response.data);
            }
        } else {
            message.error("Get user information failed");
        }
    };

    return (
        <></>
    )
}

export default GetUserInfo