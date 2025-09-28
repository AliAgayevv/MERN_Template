// src/App.tsx - Yenilənmiş versiya
// import { RouterProvider } from "react-router-dom";
// import { router } from "./const/router/router";
// import { Provider } from "react-redux";
// import { store } from "./store";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-purple-200 via-pink-200 to-yellow-100 text-center justify-center items-center">
      <h1 className="text-2xl w-1/3 font-bold  py-10">
        Standart template for MERN stack with TS, Redux Toolkit, TailwindCSS
      </h1>
      <h4 className="text-blue-500 underline">
        <a href="https://github.com/AliAgayevv">GitHub Repository</a>
      </h4>

      <h6 className="font-stretch-75%">
        U can use this template as a starting point for your own MERN stack
        projects.{" "}
      </h6>
    </div>
    // Əvvəlki kod:
    //   <Provider store={store}>
    //     <RouterProvider router={router} />
    //   </Provider>
  );
}

export default App;
