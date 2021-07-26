import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: '#cfe8fc',
            overflow: 'scroll',
            height: "100vh"
        },
        micContainer: {
            // textAlign: "center"
        },
        mic: {
            display: 'block',
            cursor: 'pointer',
            fontSize: 80,
        }
    })
);