using FoodDiary.Migrator;

try
{
    var resultCode = await MigrationRunner.RunMigrations(args);
    return resultCode;
}
catch (Exception e)
{
    Console.WriteLine(e);
    return -1;
}

