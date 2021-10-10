import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            height: "100vh"
        },
        micContainer: {
        },
        mic: {
            display: "block",
            cursor: "pointer",
            fontSize: 80,
        }
    })
);
