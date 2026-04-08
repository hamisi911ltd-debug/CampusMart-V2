import { Switch, Route } from "wouter";
import AdminLayout from "./layout";
import Dashboard from "./dashboard";
import UsersPage from "./users";
import ProductsPage from "./products";
import RoomsPage from "./rooms";
import FoodPage from "./food";
import OrdersPage from "./orders";
import SettingsPage from "./settings";

export default function AdminPortal() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/users" component={UsersPage} />
        <Route path="/admin/products" component={ProductsPage} />
        <Route path="/admin/rooms" component={RoomsPage} />
        <Route path="/admin/food" component={FoodPage} />
        <Route path="/admin/orders" component={OrdersPage} />
        <Route path="/admin/settings" component={SettingsPage} />
      </Switch>
    </AdminLayout>
  );
}
