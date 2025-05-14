import classes from './page.module.css'
import Login from "@/components/auth/Login";


export default async function Home() {

    return (
        <main className={classes.auth}>
            <Login/>
        </main>
    );
}
