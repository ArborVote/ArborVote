import { alertConstants } from "../constants";
import { toast } from "react-toastify";

export const alertActions = {
    success,
    error
};

function success(message) {
    toast.success(message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        className: "alert"
    });

    return { type: alertConstants.SUCCESS, message };
}

function error(message) {
    toast.error(message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        className: "alert"
    });
    return { type: alertConstants.ERROR, message };
}
